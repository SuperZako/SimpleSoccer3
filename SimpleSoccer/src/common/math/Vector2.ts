/// <reference path="./MathHelper.ts" />

class Vector2 {
    public static clockwise = 1;
    public static anticlockwise = -1;

    constructor(public x = 0, public y = 0) { }


    // Returns a Vector2 with both of its components set to one.
    public static get One() {
        return new Vector2(1, 1);
    }

    // 	Returns the unit vector for the x-axis.
    public static get UnitX() {
        return new Vector2(1, 0);
    }

    // Returns the unit vector for the y-axis.
    public static get UnitY() {
        return new Vector2(0, 1);
    }

    // Returns a Vector2 with all of its components set to zero.
    public static get Zero() {
        return new Vector2(0, 0);
    }


    //overload the + operator
    public static add(lhs: Vector2, rhs: Vector2) {
        let x = lhs.x + rhs.x;
        let y = lhs.y + rhs.y;
        return new Vector2(x, y);
    }

    //overload the - operator
    public static subtract(lhs: Vector2, rhs: Vector2) {
        let x = lhs.x - rhs.x;
        let y = lhs.y - rhs.y;
        return new Vector2(x, y);
    }

    public static multiply(lhs: number, rhs: Vector2) {
        return new Vector2(lhs * rhs.x, lhs * rhs.y);
    }

    //overload the / operator
    public static divide(lhs: Vector2, rhs: number) {
        return new Vector2(lhs.x / rhs, lhs.y / rhs);
    }

    public set(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    public Zero() {
        this.x = 0.0;
        this.y = 0.0;
    }

    //returns true if both x and y are zero
    public isZero() {
        let x = this.x;
        let y = this.y;
        return (x * x + y * y) < /*MinDouble*/1e-6;
    }

    /**
     *   returns the length of a 2D vector
     */
    public length() {
        let x = this.x;
        let y = this.y;
        return Math.sqrt(x * x + y * y);
    }

    //returns the squared length of the vector (thereby avoiding the sqrt)
    public LengthSq() {
        let x = this.x;
        let y = this.y;
        return (x * x + y * y);
    }

    /**
     *   normalizes a 2D Vector
     */
    public Normalize() {
        let length = this.length();

        if (length > MathHelper.EpsilonDouble) {
            this.x /= length;
            this.y /= length;
        }
    }

    /**
     * calculates the dot product
     * @param v2
     * @return  dot product
     */
    public dot(vector: Vector2) {
        return this.x * vector.x + this.y * vector.y;
    }



    /**
    /* returns positive if v2 is clockwise of this vector,
    /* negative if anticlockwise (assuming the Y axis is pointing down,
    /* X axis to right like a Window app)
     */
    public Sign(v2: Vector2) {
        if (this.y * v2.x > this.x * v2.y) {
            return Vector2.anticlockwise;
        } else {
            return Vector2.clockwise;
        }
    }

    /**
     * returns the vector that is perpendicular to this one.
     */
    public Perp() {
        return new Vector2(-this.y, this.x);
    }

    /**
     * adjusts x and y so that the length of the vector does not exceed max
     * truncates a vector so that its length does not exceed max
     * @param max 
     */
    public Truncate(max: number) {
        if (this.length() > max) {
            this.Normalize();
            this.multiply(max);
        }
    }

    //    /**
    //     * calculates the euclidean distance between two vectors
    //     * 
    //     * @param v2
    //     * @return the distance between this vector and th one passed as a parameter
    //     */
    //    public double Distance(Vector2 v2) {
    //        double ySeparation = v2.y - y;
    //        double xSeparation = v2.x - x;

    //        return Math.sqrt(ySeparation * ySeparation + xSeparation * xSeparation);
    //    }

    //    /** 
    //     * squared version of distance.
    //     * calculates the euclidean distance squared between two vectors 
    //     * @param v2
    //     * @return 
    //     */
    //    public double DistanceSq(Vector2 v2) {
    //        double ySeparation = v2.y - y;
    //        double xSeparation = v2.x - x;

    //        return ySeparation * ySeparation + xSeparation * xSeparation;
    //    }

    /**
     *  given a normalized vector this method reflects the vector it
     *  is operating upon. (like the path of a ball bouncing off a wall)
     * @param norm 
     */
    public Reflect(norm: Vector2) {
        this.add(norm.negate().multiply(2.0 * this.dot(norm)));
    }

    /**
     * @return the vector that is the reverse of this vector 
     */
    public negate() {
        return new Vector2(-this.x, -this.y);
    }

    //we need some overloaded operators
    public add(rhs: Vector2) {
        this.x += rhs.x;
        this.y += rhs.y;

        return this;
    }



    //    public Vector2 sub(Vector2 rhs) {
    //        x -= rhs.x;
    //        y -= rhs.y;

    //        return this;
    //    }

    public multiply(rhs: number) {
        this.x *= rhs;
        this.y *= rhs;

        return this;
    }

    //    public Vector2 div(double rhs) {
    //        x /= rhs;
    //        y /= rhs;

    //        return this;
    //    }

    //    public boolean isEqual(Vector2 rhs) {
    //        return (utils.isEqual(x, rhs.x) && utils.isEqual(y, rhs.y));
    //    }
    //    // operator !=

    //    public boolean notEqual(Vector2 rhs) {
    //        return (x != rhs.x) || (y != rhs.y);
    //    }

    ////------------------------------------------------------------------------some more operator overloads
    //    static public Vector2 mul(Vector2 lhs, double rhs) {
    //        Vector2 result = new Vector2(lhs);
    //        result.mul(rhs);
    //        return result;
    //    }

    //    static public Vector2 mul(double lhs, Vector2 rhs) {
    //        Vector2 result = new Vector2(rhs);
    //        result.mul(lhs);
    //        return result;
    //    }

    ////overload the - operator
    //    static public Vector2 sub(Vector2 lhs, Vector2 rhs) {
    //        Vector2 result = new Vector2(lhs);
    //        result.x -= rhs.x;
    //        result.y -= rhs.y;

    //        return result;
    //    }

    ////overload the + operator
    //    static public Vector2 add(Vector2 lhs, Vector2 rhs) {
    //        Vector2 result = new Vector2(lhs);
    //        result.x += rhs.x;
    //        result.y += rhs.y;

    //        return result;
    //    }

    ////overload the / operator
    //    static public Vector2 div(Vector2 lhs, double val) {
    //        Vector2 result = new Vector2(lhs);
    //        result.x /= val;
    //        result.y /= val;

    //        return result;
    //    }

    ////std::ostream& operator<<(std::ostream& os, const Vector2& rhs)
    //    @Override
    //    public String toString() {
    //        return " " + ttos(this.x,2) + " " + ttos(this.y,2);
    //    }

    ////std::ifstream& operator>>(std::ifstream& is, Vector2& lhs)
    //    public Vector2 read(InputStream in) {
    //        Scanner sc = new Scanner(in);

    //        this.x = sc.nextDouble();
    //        this.y = sc.nextDouble();
    //        return this;
    //    }

    ////------------------------------------------------------------------------non member functions
    //    public static Vector2 Vec2DNormalize(Vector2 v) {
    //        Vector2 vec = new Vector2(v);

    //        double vector_length = vec.Length();

    //        if (vector_length > EpsilonDouble) {
    //            vec.x /= vector_length;
    //            vec.y /= vector_length;
    //        }

    //        return vec;
    //    }

    //    public static double Vec2DDistance(Vector2 v1, Vector2 v2) {

    //        double ySeparation = v2.y - v1.y;
    //        double xSeparation = v2.x - v1.x;

    //        return Math.sqrt(ySeparation * ySeparation + xSeparation * xSeparation);
    //    }

    //    public static double Vec2DDistanceSq(Vector2 v1, Vector2 v2) {

    //        double ySeparation = v2.y - v1.y;
    //        double xSeparation = v2.x - v1.x;

    //        return ySeparation * ySeparation + xSeparation * xSeparation;
    //    }

    //    public static double Vec2DLength(Vector2 v) {
    //        return Math.sqrt(v.x * v.x + v.y * v.y);
    //    }

    //    public static double Vec2DLengthSq(Vector2 v) {
    //        return (v.x * v.x + v.y * v.y);
    //    }

    //    public static Vector2 POINTStoVector(POINTS p) {
    //        return new Vector2(p.x, p.y);
    //    }

    //    public static Vector2 POINTtoVector(POINT p) {
    //        return new Vector2((double) p.x, (double) p.y);
    //    }

    //    public static POINTS VectorToPOINTS(Vector2 v) {
    //        POINTS p = new POINTS();
    //        p.x = (short) v.x;
    //        p.y = (short) v.y;

    //        return p;
    //    }

    //    public static POINT VectorToPOINT(Vector2 v) {
    //        POINT p = new POINT();
    //        p.x = (long) v.x;
    //        p.y = (long) v.y;

    //        return p;
    //    }

    /////////////////////////////////////////////////////////////////////////////////
    ////treats a window as a toroid
    //    public static void WrapAround(Vector2 pos, int MaxX, int MaxY) {
    //        if (pos.x > MaxX) {
    //            pos.x = 0.0;
    //        }

    //        if (pos.x < 0) {
    //            pos.x = (double) MaxX;
    //        }

    //        if (pos.y < 0) {
    //            pos.y = (double) MaxY;
    //        }

    //        if (pos.y > MaxY) {
    //            pos.y = 0.0;
    //        }
    //    }

    //    /**
    //     * returns true if the point p is not inside the region defined by top_left
    //     * and bot_rgt
    //     * @param p
    //     * @param top_left
    //     * @param bot_rgt
    //     * @return 
    //     */
    //    public static boolean NotInsideRegion(Vector2 p,
    //            Vector2 top_left,
    //            Vector2 bot_rgt) {
    //        return (p.x < top_left.x) || (p.x > bot_rgt.x)
    //                || (p.y < top_left.y) || (p.y > bot_rgt.y);
    //    }

    //    public static boolean InsideRegion(Vector2 p,
    //            Vector2 top_left,
    //            Vector2 bot_rgt) {
    //        return !((p.x < top_left.x) || (p.x > bot_rgt.x)
    //                || (p.y < top_left.y) || (p.y > bot_rgt.y));
    //    }

    //    public static boolean InsideRegion(Vector2 p, int left, int top, int right, int bottom) {
    //        return !((p.x < left) || (p.x > right) || (p.y < top) || (p.y > bottom));
    //    }

    ///**
    // * @return true if the target position is in the field of view of the entity
    // *         positioned at posFirst facing in facingFirst
    // */
    //    public static boolean isSecondInFOVOfFirst(Vector2 posFirst,
    //            Vector2 facingFirst,
    //            Vector2 posSecond,
    //            double fov) {
    //        Vector2 toTarget = Vec2DNormalize(sub(posSecond, posFirst));
    //        return facingFirst.Dot(toTarget) >= Math.cos(fov / 2.0);
    //    }
}

//-------non member functions
function Vec2DNormalize(v: Vector2) {
    let vec = new Vector2(v.x, v.y);

    let length = vec.length();

    if (length > MathHelper.EpsilonDouble) {
        vec.x /= length;
        vec.y /= length;
    }

    return vec;
}

function Vec2DDistance(v1: Vector2, v2: Vector2) {

    let ySeparation = v2.y - v1.y;
    let xSeparation = v2.x - v1.x;

    return Math.sqrt(ySeparation * ySeparation + xSeparation * xSeparation);
}

function Vec2DDistanceSq(v1: Vector2, v2: Vector2) {

    let ySeparation = v2.y - v1.y;
    let xSeparation = v2.x - v1.x;

    return ySeparation * ySeparation + xSeparation * xSeparation;
}
