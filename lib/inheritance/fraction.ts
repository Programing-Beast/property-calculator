// Exact rational arithmetic to eliminate floating-point drift in share math.
export class Fraction {
  n: number;
  d: number;

  constructor(n: number, d = 1) {
    if (d === 0) throw new Error("Denominator cannot be zero");
    let num = Math.round(n);
    let den = Math.round(d);
    const g = Fraction.gcd(Math.abs(num), Math.abs(den)) || 1;
    this.n = num / g;
    this.d = den / g;
    if (this.d < 0) {
      this.n = -this.n;
      this.d = -this.d;
    }
  }

  static gcd(a: number, b: number): number {
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  add(o: Fraction): Fraction {
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o: Fraction): Fraction {
    return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  mul(o: Fraction): Fraction {
    return new Fraction(this.n * o.n, this.d * o.d);
  }
  div(o: Fraction): Fraction {
    return new Fraction(this.n * o.d, this.d * o.n);
  }
  divNumber(x: number): Fraction {
    return this.div(new Fraction(x, 1));
  }
  toFloat(): number {
    return this.n / this.d;
  }
  toString(): string {
    if (this.d === 1) return this.n.toString();
    return `${this.n}/${this.d}`;
  }
}
