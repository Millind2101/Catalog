const fs = require('fs');

// Function to convert a string number from any base to decimal (BigInt)
function convertFromAnyBase(str, base) {
    str = str.toLowerCase();
    const digits = '0123456789abcdef';
    let result = 0n;
    
    for (let i = 0; i < str.length; i++) {
        const digit = digits.indexOf(str[i]);
        if (digit >= 0 && digit < base) {
            result = result * BigInt(base) + BigInt(digit);
        } else {
            throw new Error(`Invalid digit ${str[i]} for base ${base}`);
        }
    }
    return result;
}

// Extended Euclidean Algorithm for modular multiplicative inverse
function extendedGCD(a, b) {
    if (a === 0n) return [b, 0n, 1n];
    const [gcd, x1, y1] = extendedGCD(b % a, a);
    const x = y1 - (b / a) * x1;
    const y = x1;
    return [gcd, x, y];
}

// Function to calculate modular multiplicative inverse
function modInverse(a, m) {
    const [gcd, x] = extendedGCD(a, m);
    if (gcd !== 1n) throw new Error("Modular inverse does not exist");
    return (x % m + m) % m;
}

// Prime modulus (choose a large prime number)
const PRIME = 2n ** 256n - 189n;  // A 256-bit prime number

function computeLagrangeBasis(points, i) {
    let result = 1n;
    const xi = points[i][0];
    
    for (let j = 0; j < points.length; j++) {
        if (j !== i) {
            const xj = points[j][0];
            const num = (0n - xj + PRIME) % PRIME;
            const den = (xi - xj + PRIME) % PRIME;
            const denInv = modInverse(den, PRIME);
            result = (result * num * denInv) % PRIME;
        }
    }
    return result;
}

// Function to find the secret using Lagrange interpolation
function findSecret(data) {
    const k = data.keys.k;
    const points = [];
    
    // Collect first k points
    for (let i = 1; points.length < k; i++) {
        const point = data[i.toString()];
        if (point) {
            const x = BigInt(i);
            const y = convertFromAnyBase(point.value, parseInt(point.base));
            points.push([x, y % PRIME]);
        }
    }
    
    // Calculate secret using Lagrange interpolation with modular arithmetic
    let secret = 0n;
    for (let i = 0; i < points.length; i++) {
        const basis = computeLagrangeBasis(points, i);
        secret = (secret + (points[i][1] * basis) % PRIME) % PRIME;
    }
    
    return secret;
}

// Test cases
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "7",
        "value": "420020006424065463"
    },
    "2": {
        "base": "7",
        "value": "10511630252064643035"
    },
    "3": {
        "base": "2",
        "value": "101010101001100101011100000001000111010010111101100100010"
    },
    "4": {
        "base": "8",
        "value": "31261003022226126015"
    },
    "5": {
        "base": "7",
        "value": "2564201006101516132035"
    },
    "6": {
        "base": "15",
        "value": "a3c97ed550c69484"
    },
    "7": {
        "base": "13",
        "value": "134b08c8739552a734"
    },
    "8": {
        "base": "10",
        "value": "23600283241050447333"
    },
    "9": {
        "base": "9",
        "value": "375870320616068547135"
    },
    "10": {
        "base": "6",
        "value": "30140555423010311322515333"
    }
};

try {
    console.log("Secret for Test Case 1:", findSecret(testCase1).toString());
    console.log("Secret for Test Case 2:", findSecret(testCase2).toString());
} catch (error) {
    console.error("Error:", error.message);
}