import {useState, useEffect} from 'react';
import {Dimensions, ScaledSize} from 'react-native';

export const useResponsiveDimensions = () => {
  const [dims, setDims] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const handler = ({window}: {window: ScaledSize}) => setDims(window);
    const sub = Dimensions.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  return dims;
};
