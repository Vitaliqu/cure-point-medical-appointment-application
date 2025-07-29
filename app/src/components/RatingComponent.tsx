import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { RatingComponentProps } from '@/interfaces/interfaces';

const RatingComponent: React.FC<RatingComponentProps> = ({ isRated, currentRating = 0, onRate, onChangeRating }) => {
  if (isRated) {
    return (
      <>
        <span className="text-sm text-gray-500">Your rating:</span>
        {[1, 2, 3, 4, 5].map((rate) => (
          <Star key={rate} className={`w-5 h-5 ${rate <= currentRating ? 'text-yellow-500' : 'text-gray-300'}`} />
        ))}
        <button
          onClick={onChangeRating}
          className="ml-2 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          (Change rating)
        </button>
      </>
    );
  }
  return (
    <>
      {[1, 2, 3, 4, 5].map((rate) => (
        <button
          key={rate}
          onClick={() => {
            onRate(rate);
            isRated = true;
          }}
          className="text-yellow-500 hover:text-yellow-700 focus:outline-none"
        >
          <Star className="w-5 h-5" />
        </button>
      ))}
      <span className="text-sm text-gray-500">(Rate this appointment)</span>
    </>
  );
};
export default memo(RatingComponent);
