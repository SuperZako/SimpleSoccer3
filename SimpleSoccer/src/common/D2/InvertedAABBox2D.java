/**
 * @author Petr (http://www.sallyx.org/)
 */
package common.D2;

import static common.D2.Vector2.add;
import static common.misc.Cgdi.gdi;

public class InvertedAABBox2D {

    private Vector2 m_vTopLeft;
    private Vector2 m_vBottomRight;
    private Vector2 m_vCenter;

    public InvertedAABBox2D(Vector2 tl, Vector2 br) {
        m_vTopLeft = tl;
        m_vBottomRight = br;
        m_vCenter = add(tl, br).div(2.0);
    }

//returns true if the bbox described by other intersects with this one
    public boolean isOverlappedWith(InvertedAABBox2D other) {
        return !((other.Top() > this.Bottom())
                || (other.Bottom() < this.Top())
                || (other.Left() > this.Right())
                || (other.Right() < this.Left()));
    }

    public Vector2 TopLeft() {
        return m_vTopLeft;
    }

    public Vector2 BottomRight() {
        return m_vBottomRight;
    }

    public double Top() {
        return m_vTopLeft.y;
    }

    public double Left() {
        return m_vTopLeft.x;
    }

    public double Bottom() {
        return m_vBottomRight.y;
    }

    public double Right() {
        return m_vBottomRight.x;
    }

    public Vector2 Center() {
        return m_vCenter;
    }

    public void Render() {
        Render(false);
    }

    public void Render(boolean RenderCenter) {
        gdi.Line((int) Left(), (int) Top(), (int) Right(), (int) Top());
        gdi.Line((int) Left(), (int) Bottom(), (int) Right(), (int) Bottom());
        gdi.Line((int) Left(), (int) Top(), (int) Left(), (int) Bottom());
        gdi.Line((int) Right(), (int) Top(), (int) Right(), (int) Bottom());

        if (RenderCenter) {
            gdi.Circle(m_vCenter, 5);
        }
    }
}