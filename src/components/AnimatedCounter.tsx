import CountUp from 'react-countup';
import { formatCurrency } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
}

export function AnimatedCounter({ value }: AnimatedCounterProps) {
  return (
    <CountUp
      end={value}
      duration={1.5}
      separator=","
      decimals={2}
      formattingFn={formatCurrency}
    />
  );
}