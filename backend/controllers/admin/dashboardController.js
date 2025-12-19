import News from '../../models/News.js';
import Category from '../../models/Category.js';
import User from '../../models/User.js';
import Feedback from '../../models/Feedback.js';
import Rating from '../../models/Rating.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // News Statistics
    const publishedCount = await News.countDocuments({ status: 'published' });
    const draftCount = await News.countDocuments({ status: 'draft' });
    
    // Today's news
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayCount = await News.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // This week's news
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekCount = await News.countDocuments({
      createdAt: { $gte: weekStart }
    });

    // Category Statistics
    const totalCategories = await Category.countDocuments({ status: 'active' });
    
    // Get categories with news counts
    const categoriesWithCounts = await Category.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'news',
          localField: '_id',
          foreignField: 'category',
          as: 'newsItems'
        }
      },
      {
        $project: {
          name: 1,
          newsCount: { $size: '$newsItems' }
        }
      },
      { $sort: { newsCount: -1 } },
      { $limit: 6 }
    ]);

    const categoryBreakdown = categoriesWithCounts.map(cat => ({
      name: cat.name,
      count: cat.newsCount || 0
    }));

    const mostPopularCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].name : '';

    // Breaking News
    const breakingNewsCount = await News.countDocuments({
      status: 'published',
      isBreakingNews: true
    });

    const recentBreakingNews = await News.find({
      status: 'published',
      isBreakingNews: true
    })
      .select('title publishDate createdAt')
      .sort({ publishDate: -1 })
      .limit(5)
      .lean();

    // Format breaking news with relative time
    const formatTimeAgo = (date) => {
      const now = new Date();
      const diffMs = now - new Date(date);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins} मिनट पहले`;
      } else if (diffHours < 24) {
        return `${diffHours} घंटे पहले`;
      } else if (diffDays < 7) {
        return `${diffDays} दिन पहले`;
      } else {
        return new Date(date).toLocaleDateString('hi-IN');
      }
    };

    const formattedBreakingNews = recentBreakingNews.map(news => ({
      id: news._id.toString(),
      title: news.title,
      time: formatTimeAgo(news.publishDate || news.createdAt)
    }));

    // User Engagement
    const totalUsers = await User.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    
    // Average Rating
    const ratings = await Rating.find();
    const ratingSum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = ratings.length > 0 ? (ratingSum / ratings.length).toFixed(1) : '0.0';

    // Recent Activity (Recent news created/updated)
    const recentNews = await News.find()
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentActivity = recentNews.slice(0, 3).map((news, index) => {
      const action = news.status === 'published' ? 'प्रकाशित' : news.status === 'draft' ? 'बनाया' : 'संपादित';
      const item = news.status === 'published' ? 'समाचार लेख' : 'समाचार लेख';
      const userName = news.createdBy?.name || news.createdBy?.username || 'एडमिन';
      
      return {
        id: news._id.toString(),
        action,
        item,
        user: userName,
        time: formatTimeAgo(news.createdAt)
      };
    });

    res.json({
      success: true,
      data: {
        totalNews: {
          published: publishedCount,
          draft: draftCount,
          today: todayCount,
          thisWeek: thisWeekCount
        },
        categories: {
          total: totalCategories,
          breakdown: categoryBreakdown,
          mostPopular: mostPopularCategory
        },
        breakingNews: {
          active: breakingNewsCount,
          recent: formattedBreakingNews
        },
        userEngagement: {
          totalUsers,
          totalFeedback,
          averageRating: parseFloat(averageRating)
        },
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


