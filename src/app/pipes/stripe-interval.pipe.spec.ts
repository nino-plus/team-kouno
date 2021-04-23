import { StripeIntervalPipe } from './stripe-interval.pipe';

describe('StripeIntervalPipe', () => {
  it('create an instance', () => {
    const pipe = new StripeIntervalPipe();
    expect(pipe).toBeTruthy();
  });
});
