/**
 * Advanced Decimal implementation for Aether Project
 * Handles numbers up to 1e10000+ with full mathematical operations
 */

class AetherDecimal {
    constructor(value = 0) {
        this.sign = 1;
        this.layer = 0;
        this.mag = 0;

        if (value instanceof AetherDecimal) {
            this.sign = value.sign;
            this.layer = value.layer;
            this.mag = value.mag;
        } else if (typeof value === 'string') {
            this.fromString(value);
        } else if (typeof value === 'number') {
            this.fromNumber(value);
        }
    }

    static get ZERO() { return new AetherDecimal(0); }
    static get ONE() { return new AetherDecimal(1); }
    static get TEN() { return new AetherDecimal(10); }
    static get E() { return new AetherDecimal(Math.E); }

    fromNumber(value) {
        if (!isFinite(value) || isNaN(value)) {
            this.sign = 1;
            this.layer = 0;
            this.mag = 0;
            return this;
        }

        if (value < 0) {
            this.sign = -1;
            value = -value;
        } else {
            this.sign = 1;
        }

        if (value === 0) {
            this.layer = 0;
            this.mag = 0;
            return this;
        }

        this.layer = 0;
        this.mag = value;
        this.normalize();
        return this;
    }

    fromString(value) {
        const trimmed = value.trim().toLowerCase();

        if (trimmed === 'infinity' || trimmed === 'inf') {
            this.sign = 1;
            this.layer = Number.POSITIVE_INFINITY;
            this.mag = Number.POSITIVE_INFINITY;
            return this;
        }

        let sign = 1;
        let str = trimmed;
        if (str.startsWith('-')) {
            sign = -1;
            str = str.substring(1);
        }

        // Handle scientific notation
        if (str.includes('e')) {
            const parts = str.split('e');
            if (parts.length === 2) {
                const mantissa = parseFloat(parts[0]);
                const exponent = parseInt(parts[1]);

                if (!isNaN(mantissa) && !isNaN(exponent)) {
                    this.sign = sign;
                    this.layer = 0;
                    this.mag = mantissa * Math.pow(10, exponent);
                    this.normalize();
                    return this;
                }
            }
        }

        const num = parseFloat(str);
        if (!isNaN(num)) {
            this.fromNumber(sign * num);
        } else {
            this.fromNumber(0);
        }
        return this;
    }

    normalize() {
        if (this.mag === 0) {
            this.layer = 0;
            return this;
        }

        if (this.layer === 0) {
            if (this.mag >= 1e308) {
                this.layer = 1;
                this.mag = Math.log10(this.mag);
            }
        }

        while (this.layer > 0 && this.mag >= 308) {
            this.layer++;
            this.mag = Math.log10(this.mag);
        }

        while (this.layer > 0 && this.mag < 1) {
            this.layer--;
            this.mag = Math.pow(10, this.mag);
        }

        if (this.mag < 0) {
            this.mag = 0;
            this.layer = 0;
        }

        return this;
    }

    toString() {
        if (this.mag === 0) return '0';
        if (this.layer === 0) {
            if (this.mag < 1000) {
                return (this.sign * this.mag).toFixed(2);
            } else {
                return (this.sign * this.mag).toExponential(2);
            }
        } else if (this.layer === 1) {
            return `${this.sign === -1 ? '-' : ''}1e${this.mag.toFixed(0)}`;
        } else {
            return `${this.sign === -1 ? '-' : ''}e${this.layer}#${this.mag.toFixed(2)}`;
        }
    }

    toNumber() {
        if (this.layer === 0) {
            return this.sign * this.mag;
        } else if (this.layer === 1) {
            return this.sign * Math.pow(10, this.mag);
        } else {
            return this.sign * Number.POSITIVE_INFINITY;
        }
    }

    // Comparison methods
    eq(other) {
        other = new AetherDecimal(other);
        return this.sign === other.sign &&
               this.layer === other.layer &&
               this.mag === other.mag;
    }

    lt(other) {
        other = new AetherDecimal(other);
        if (this.sign !== other.sign) return this.sign < other.sign;
        if (this.sign === -1) return other.abs().lt(this.abs());
        if (this.layer !== other.layer) return this.layer < other.layer;
        return this.mag < other.mag;
    }

    lte(other) { return this.lt(other) || this.eq(other); }
    gt(other) { return !this.lte(other); }
    gte(other) { return !this.lt(other); }
    neq(other) { return !this.eq(other); }

    // Basic arithmetic
    add(other) {
        other = new AetherDecimal(other);

        if (this.mag === 0) return other.clone();
        if (other.mag === 0) return this.clone();

        if (this.sign !== other.sign) {
            return this.sub(other.neg());
        }

        if (this.layer !== other.layer) {
            return this.layer > other.layer ? this.clone() : other.clone();
        }

        if (this.layer === 0) {
            const result = new AetherDecimal();
            result.sign = this.sign;
            result.layer = 0;
            result.mag = this.mag + other.mag;
            return result.normalize();
        } else {
            return this.layer > other.layer ? this.clone() : other.clone();
        }
    }

    sub(other) {
        other = new AetherDecimal(other);
        return this.add(other.neg());
    }

    mul(other) {
        other = new AetherDecimal(other);

        if (this.mag === 0 || other.mag === 0) return AetherDecimal.ZERO;

        const result = new AetherDecimal();
        result.sign = this.sign * other.sign;

        if (this.layer === 0 && other.layer === 0) {
            result.layer = 0;
            result.mag = this.mag * other.mag;
        } else if (this.layer === 1 && other.layer === 0) {
            result.layer = 1;
            result.mag = this.mag + Math.log10(other.mag);
        } else if (this.layer === 0 && other.layer === 1) {
            result.layer = 1;
            result.mag = Math.log10(this.mag) + other.mag;
        } else if (this.layer === 1 && other.layer === 1) {
            result.layer = 1;
            result.mag = this.mag + other.mag;
        } else {
            result.layer = Math.max(this.layer, other.layer);
            result.mag = Math.max(this.mag, other.mag);
        }

        return result.normalize();
    }

    div(other) {
        other = new AetherDecimal(other);
        if (other.mag === 0) return AetherDecimal.ZERO;
        return this.mul(other.recip());
    }

    pow(other) {
        other = new AetherDecimal(other);

        if (other.mag === 0) return AetherDecimal.ONE;
        if (this.mag === 0) return AetherDecimal.ZERO;
        if (other.eq(1)) return this.clone();

        const result = new AetherDecimal();
        result.sign = this.sign < 0 && other.toNumber() % 2 === 1 ? -1 : 1;

        if (this.layer === 0 && other.layer === 0) {
            if (other.mag < 1000) {
                result.layer = 0;
                result.mag = Math.pow(Math.abs(this.mag), other.mag);
            } else {
                result.layer = 1;
                result.mag = other.mag * Math.log10(Math.abs(this.mag));
            }
        } else if (this.layer === 1 && other.layer === 0) {
            result.layer = 1;
            result.mag = this.mag * other.mag;
        } else {
            result.layer = this.layer;
            result.mag = this.mag;
        }

        return result.normalize();
    }

    // Utility methods
    abs() {
        const result = this.clone();
        result.sign = 1;
        return result;
    }

    neg() {
        const result = this.clone();
        result.sign *= -1;
        return result;
    }

    recip() {
        if (this.mag === 0) return AetherDecimal.ZERO;

        const result = new AetherDecimal();
        result.sign = this.sign;

        if (this.layer === 0) {
            result.layer = 0;
            result.mag = 1 / this.mag;
        } else {
            result.layer = this.layer;
            result.mag = -this.mag;
        }

        return result.normalize();
    }

    sqrt() {
        return this.pow(0.5);
    }

    log10() {
        if (this.mag <= 0) return AetherDecimal.ZERO;

        const result = new AetherDecimal();
        result.sign = 1;

        if (this.layer === 0) {
            result.layer = 0;
            result.mag = Math.log10(this.mag);
        } else if (this.layer === 1) {
            result.layer = 0;
            result.mag = this.mag;
        } else {
            result.layer = this.layer - 1;
            result.mag = this.mag;
        }

        return result;
    }

    ln() {
        return this.log10().mul(Math.LN10);
    }

    clone() {
        const result = new AetherDecimal();
        result.sign = this.sign;
        result.layer = this.layer;
        result.mag = this.mag;
        return result;
    }

    // Convenience methods
    static min(a, b) {
        return new AetherDecimal(a).lt(b) ? new AetherDecimal(a) : new AetherDecimal(b);
    }

    static max(a, b) {
        return new AetherDecimal(a).gt(b) ? new AetherDecimal(a) : new AetherDecimal(b);
    }

    static pow(base, exp) {
        return new AetherDecimal(base).pow(exp);
    }

    // Serialization
    toJSON() {
        return {
            sign: this.sign,
            layer: this.layer,
            mag: this.mag
        };
    }

    static fromJSON(data) {
        const result = new AetherDecimal();
        result.sign = data.sign || 1;
        result.layer = data.layer || 0;
        result.mag = data.mag || 0;
        return result;
    }
}

// Global alias for convenience
if (typeof window !== 'undefined') {
    window.Decimal = AetherDecimal;
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AetherDecimal;
}