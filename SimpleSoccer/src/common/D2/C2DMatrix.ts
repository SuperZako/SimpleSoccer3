/**
 * Desc:   2D Matrix class 
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package common.D2;

//import java.util.List;
//import java.util.ListIterator;
namespace SimpleSoccer {
    class Matrix {

        public _11 = 0; public _12 = 0; public _13 = 0;
        public _21 = 0; public _22 = 0; public _23 = 0;
        public _31 = 0; public _32 = 0; public _33 = 0;
    }

    export class C2DMatrix {


        private m_Matrix = new Matrix();

        constructor() {
            //initialize the matrix to an identity matrix
            this.Identity();
        }

        //accessors to the matrix elements
        public _11(val: number) {
            this.m_Matrix._11 = val;
        }

        public _12(val: number) {
            this.m_Matrix._12 = val;
        }

        public _13(val: number) {
            this.m_Matrix._13 = val;
        }

        public _21(val: number) {
            this.m_Matrix._21 = val;
        }

        public _22(val: number) {
            this.m_Matrix._22 = val;
        }

        public _23(val: number) {
            this.m_Matrix._23 = val;
        }

        public _31(val: number) {
            this.m_Matrix._31 = val;
        }

        public _32(val: number) {
            this.m_Matrix._32 = val;
        }

        public _33(val: number) {
            this.m_Matrix._33 = val;
        }



        //applies a 2D transformation matrix to a std::vector of Vector2Ds
        //public TransformVector2Ds(vPoint: Vector2D[]) {
        //    //ListIterator < Vector2D > it = vPoint.listIterator();
        //    //while (it.hasNext()) {
        //    for (let it of vPoint) {
        //        let tempX = (this.m_Matrix._11 * it.x) + (this.m_Matrix._21 * it.y) + (this.m_Matrix._31);
        //        let tempY = (this.m_Matrix._12 * it.x) + (this.m_Matrix._22 * it.y) + (this.m_Matrix._32);
        //        it.x = tempX;
        //        it.y = tempY;
        //    }
        //}

        //applies a 2D transformation matrix to a single Vector2D
        public TransformVector2Ds(vPoint: Vector2D) {

            let tempX = (this.m_Matrix._11 * vPoint.x) + (this.m_Matrix._21 * vPoint.y) + (this.m_Matrix._31);
            let tempY = (this.m_Matrix._12 * vPoint.x) + (this.m_Matrix._22 * vPoint.y) + (this.m_Matrix._32);

            vPoint.x = tempX;
            vPoint.y = tempY;
        }

        //create an identity matrix
        public Identity() {
            this.m_Matrix._11 = 1;
            this.m_Matrix._12 = 0;
            this.m_Matrix._13 = 0;
            this.m_Matrix._21 = 0;
            this.m_Matrix._22 = 1;
            this.m_Matrix._23 = 0;
            this.m_Matrix._31 = 0;
            this.m_Matrix._32 = 0;
            this.m_Matrix._33 = 1;

        }

        ////create a transformation matrix
        //    public void Translate(double x, double y) {
        //        Matrix mat = new Matrix();

        //        mat._11 = 1; mat._12 = 0; mat._13 = 0;

        //        mat._21 = 0; mat._22 = 1; mat._23 = 0;

        //        mat._31 = x; mat._32 = y; mat._33 = 1;

        //        //and multiply
        //        MatrixMultiply(mat);
        //    }

        ////create a scale matrix
        //    public void Scale(double xScale, double yScale) {
        //        Matrix mat = new Matrix();

        //        mat._11 = xScale; mat._12 = 0; mat._13 = 0;

        //        mat._21 = 0; mat._22 = yScale; mat._23 = 0;

        //        mat._31 = 0; mat._32 = 0; mat._33 = 1;

        //        //and multiply
        //        MatrixMultiply(mat);
        //    }

        //create a rotation matrix
        public Rotate(rot: number) {
            let mat = new Matrix();

            let Sin = Math.sin(rot);
            let Cos = Math.cos(rot);

            mat._11 = Cos; mat._12 = Sin; mat._13 = 0;
            mat._21 = -Sin; mat._22 = Cos; mat._23 = 0;
            mat._31 = 0; mat._32 = 0; mat._33 = 1;

            //and multiply
            this.MatrixMultiply(mat);
        }

        ////create a rotation matrix from a 2D vector
        //    public void Rotate(Vector2D fwd, Vector2D side) {
        //        Matrix mat = new Matrix();

        //        mat._11 = fwd.x; mat._12 = fwd.y;  mat._13 = 0;
        //        mat._21 = side.x; mat._22 = side.y; mat._23 = 0;
        //        mat._31 = 0;mat._32 = 0;mat._33 = 1;

        //        //and multiply
        //        MatrixMultiply(mat);
        //    }

        //multiply two matrices together
        private MatrixMultiply(mIn: Matrix) {
            let mat_temp = new Matrix();

            //first row
            mat_temp._11 = (this.m_Matrix._11 * mIn._11) + (this.m_Matrix._12 * mIn._21) + (this.m_Matrix._13 * mIn._31);
            mat_temp._12 = (this.m_Matrix._11 * mIn._12) + (this.m_Matrix._12 * mIn._22) + (this.m_Matrix._13 * mIn._32);
            mat_temp._13 = (this.m_Matrix._11 * mIn._13) + (this.m_Matrix._12 * mIn._23) + (this.m_Matrix._13 * mIn._33);

            //second
            mat_temp._21 = (this.m_Matrix._21 * mIn._11) + (this.m_Matrix._22 * mIn._21) + (this.m_Matrix._23 * mIn._31);
            mat_temp._22 = (this.m_Matrix._21 * mIn._12) + (this.m_Matrix._22 * mIn._22) + (this.m_Matrix._23 * mIn._32);
            mat_temp._23 = (this.m_Matrix._21 * mIn._13) + (this.m_Matrix._22 * mIn._23) + (this.m_Matrix._23 * mIn._33);

            //third
            mat_temp._31 = (this.m_Matrix._31 * mIn._11) + (this.m_Matrix._32 * mIn._21) + (this.m_Matrix._33 * mIn._31);
            mat_temp._32 = (this.m_Matrix._31 * mIn._12) + (this.m_Matrix._32 * mIn._22) + (this.m_Matrix._33 * mIn._32);
            mat_temp._33 = (this.m_Matrix._31 * mIn._13) + (this.m_Matrix._32 * mIn._23) + (this.m_Matrix._33 * mIn._33);

            this.m_Matrix = mat_temp;
        }
    }
}