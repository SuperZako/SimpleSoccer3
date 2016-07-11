/**
 *  Desc:   Defines a rectangular region. A region has an identifying
 *          number, and four corners.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package common.Game;

//import common.misc.Cgdi;
//import static common.misc.Cgdi.gdi;
//import common.D2.Vector2D;
//import static common.misc.utils.RandInRange;
//import static common.misc.Stream_Utility_function.ttos;
//import static java.lang.Math.*;

namespace SimpleSoccer {
    export enum region_modifier {
        halfsize,
        normal,
    }
    export class Region {

        public static halfsize = region_modifier.halfsize;
        public static normal = region_modifier.normal;


        protected m_dTop: number;
        protected m_dLeft: number;
        protected m_dRight: number;
        protected m_dBottom: number;
        protected m_dWidth: number;
        protected m_dHeight: number;
        protected m_vCenter: Vector2D;
        protected m_iID: number;

        //public Region() {
        //    this(0, 0, 0, 0, -1);
        //}

        //public Region(double left,
        //        double top,
        //        double right,
        //        double bottom) {
        //    this(left, top, right, bottom, -1);
        //}

        public constructor(left: number, top: number, right: number, bottom: number, id = -1) {
            this.m_dTop = top;
            this.m_dRight = right;
            this.m_dLeft = left;
            this.m_dBottom = bottom;
            this.m_iID = id;

            //calculate center of region
            this.m_vCenter = new Vector2D((left + right) * 0.5, (top + bottom) * 0.5);

            this.m_dWidth = Math.abs(right - left);
            this.m_dHeight = Math.abs(bottom - top);
        }

        //public void Render() {
        //    Render(false);
        //}

        //public void Render(boolean ShowID) {
        //    gdi.HollowBrush();
        //    gdi.GreenPen();
        //    gdi.Rect(m_dLeft, m_dTop, m_dRight, m_dBottom);

        //    if (ShowID) {
        //        gdi.TextColor(Cgdi.green);
        //        gdi.TextAtPos(Center(), ttos(ID()));
        //    }
        //}

        ///**
        // * returns true if the given position lays inside the region. The
        // * region modifier can be used to contract the region bounderies
        // */
        //public boolean Inside(Vector2D pos) {
        //    return Inside(pos, region_modifier.normal);
        //}

        public Inside(pos: Vector2D, r = region_modifier.normal) {
            if (r == region_modifier.normal) {
                return ((pos.x > this.m_dLeft) && (pos.x < this.m_dRight) && (pos.y > this.m_dTop) && (pos.y < this.m_dBottom));
            } else {
                const marginX = this.m_dWidth * 0.25;
                const marginY = this.m_dHeight * 0.25;

                return ((pos.x > (this.m_dLeft + marginX)) && (pos.x < (this.m_dRight - marginX)) &&
                    (pos.y > (this.m_dTop + marginY)) && (pos.y < (this.m_dBottom - marginY)));
            }
        }

        ///** 
        // * @return a vector representing a random location
        // *          within the region
        // */
        //public Vector2D GetRandomPosition() {
        //    return new Vector2D(RandInRange(m_dLeft, m_dRight),
        //            RandInRange(m_dTop, m_dBottom));
        //}

        //-------------------------------
        public Top() {
            return this.m_dTop;
        }

        public Bottom() {
            return this.m_dBottom;
        }

        public Left() {
            return this.m_dLeft;
        }

        public Right() {
            return this.m_dRight;
        }

        public Width() {
            return Math.abs(this.m_dRight - this.m_dLeft);
        }

        public Height() {
            return Math.abs(this.m_dTop - this.m_dBottom);
        }

        public Length() {
            return Math.max(this.Width(), this.Height());
        }

        public Breadth() {
            return Math.min(this.Width(), this.Height());
        }

        public Center() {
            return new Vector2D(this.m_vCenter.x, this.m_vCenter.y);
        }

        //public int ID() {
        //    return m_iID;
        //}
    }
}