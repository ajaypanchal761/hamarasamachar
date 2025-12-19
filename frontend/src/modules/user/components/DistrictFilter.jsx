import { RAJASTHAN_DISTRICTS } from '../constants/districts';

function DistrictFilter({ selectedDistrict, onDistrictChange }) {
  return (
    <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
        <span className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
          किस जिले की खबर चाहिए?
        </span>
        <div className="flex gap-2 sm:gap-3">
          {RAJASTHAN_DISTRICTS.map((district) => (
            <button
              key={district}
              onClick={() => onDistrictChange(district)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${selectedDistrict === district
                  ? 'bg-[#E21E26] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
            >
              {district}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DistrictFilter;

