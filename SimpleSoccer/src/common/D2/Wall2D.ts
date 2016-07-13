/**
 * 
 *  Desc:   class to create and render 2D walls. Defined as the two 
 *          vectors A - B with a perpendicular normal. 
 *
 * @author Petr (http://www.sallyx.org/)
 */
//package common.D2;

//import java.util.Scanner;
//import java.io.PrintStream;
//import java.io.InputStream;
//import static common.D2.Vector2.*;
//import static common.misc.Cgdi.gdi;
namespace SimpleSoccer {
    export class Wall2D {

        protected m_vA = new Vector2();
        protected m_vB = new Vector2();
        protected m_vN = new Vector2();



        //public Wall2D() {
        //}

        constructor(A: Vector2, B: Vector2) {
            this.m_vA = A;
            this.m_vB = B;
            this.CalculateNormal();
        }

        //public Wall2D(Vector2 A, Vector2 B, Vector2 N) {
        //    m_vA = A;
        //    m_vB = B;
        //    m_vN = N;
        //}

        //public Wall2D(InputStream in) {
        //    Read(in);
        //}

        //public void Render() {
        //    Render(false);
        //}

        public Render(ctx: CanvasRenderingContext2D, RenderNormals = false) {
            //gdi.Line(m_vA, m_vB);

            ctx.beginPath();
            ctx.moveTo(this.m_vA.x, this.m_vA.y);
            ctx.lineTo(this.m_vB.x, this.m_vB.y);
            ctx.closePath();
            ctx.stroke();

            ////render the normals if rqd
            //if (RenderNormals) {
            //    int MidX = (int) ((m_vA.x + m_vB.x) / 2);
            //    int MidY = (int) ((m_vA.y + m_vB.y) / 2);

            //    gdi.Line(MidX, MidY, (int) (MidX + (m_vN.x * 5)), (int) (MidY + (m_vN.y * 5)));
            //}
        }

        public From() {
            return this.m_vA;
        }

        public SetFrom(v: Vector2) {
            this.m_vA = v;
            this.CalculateNormal();
        }

        public To() {
            return this.m_vB;
        }

        //public void SetTo(Vector2 v) {
        //    m_vB = v;
        //    CalculateNormal();
        //}

        public Normal() {
            return this.m_vN;
        }

        //public void SetNormal(Vector2 n) {
        //    m_vN = n;
        //}

        //public Vector2 Center() {
        //    return div(add(m_vA, m_vB), 2.0);
        //}

        //public PrintStream Write(PrintStream os) {
        //    os.println();
        //    os.print(From() + ",");
        //    os.print(To() + ",");
        //    os.print(Normal());
        //    return os;
        //}

        //public void Read(InputStream in) {
        //    double x, y;
        //    Scanner br = new Scanner(in);
        //    x = br.nextDouble();
        //    y = br.nextDouble();

        //    SetFrom(new Vector2(x, y));

        //    x = br.nextDouble();
        //    y = br.nextDouble();
        //    SetTo(new Vector2(x, y));

        //    x = br.nextDouble();
        //    y = br.nextDouble();
        //    SetNormal(new Vector2(x, y));
        //}

        protected CalculateNormal() {
            let temp = Vec2DNormalize(Vector2.subtract(this.m_vB, this.m_vA));

            this.m_vN.x = -temp.y;
            this.m_vN.y = temp.x;
        }
    }
}