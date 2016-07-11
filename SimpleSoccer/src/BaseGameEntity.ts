///**
// * Desc: Base class to define a common interface for all game
// *       entities
// * 
// * @author Petr (http://www.sallyx.org/)
// */
//package SimpleSoccer;

//import common.D2.Vector2D;
//import common.Messaging.Telegram;
//import static common.misc.utils.*;

namespace SimpleSoccer {
    export abstract class BaseGameEntity {

        public static default_entity_type = -1;
        //each entity has a unique ID
        private m_ID: number;
        //every entity has a type associated with it (health, troll, ammo etc)
        private m_iType: number;
        //    //this is a generic flag. 
        private m_bTag: boolean;
        //    //this is the next valid ID. Each time a BaseGameEntity is instantiated
        //    //this value is updated
        private static m_iNextValidID = 0;

        /**
         *  this must be called within each constructor to make sure the ID is set
         *  correctly. It verifies that the value passed to the method is greater
         *  or equal to the next valid ID, before setting the ID and incrementing
         *  the next valid ID
         */
        private SetID(val: number) {
            //make sure the val is equal to or greater than the next available ID
            //assert (val >= m_iNextValidID) : "<BaseGameEntity::SetID>: invalid ID";

            this.m_ID = val;

            BaseGameEntity.m_iNextValidID = this.m_ID + 1;
        }
        //its location in the environment
        protected m_vPosition = new Vector2D();
        protected m_vScale = new Vector2D();
        //the magnitude of this object's bounding radius
        protected m_dBoundingRadius: number;

        //------------------------------ ctor -----------------------------------------
        //-----------------------------------------------------------------------------
        constructor(ID: number) {
            this.m_dBoundingRadius = 0.0;
            this.m_vScale = new Vector2D(1.0, 1.0);
            this.m_iType = BaseGameEntity.default_entity_type;
            this.m_bTag = false;

            this.SetID(ID);
        }

        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //    }

        public Update() {
        }

        public abstract Render(ctx: CanvasRenderingContext2D): void;

        public abstract HandleMessage(msg: Telegram): boolean; //{
        //return false;
        //}

        //    //entities should be able to read/write their data to a stream
        //    //virtual void Write(std::ostream&  os)const{}
        //    //virtual void Read (std::ifstream& is){}
        //use this to grab the next valid ID
        public static GetNextValidID() {
            return this.m_iNextValidID;
        }

        //    //this can be used to reset the next ID
        //    public static void ResetNextValidID() {
        //        m_iNextValidID = 0;
        //    }

        public Pos() {
            return new Vector2D(this.m_vPosition.x, this.m_vPosition.y);
        }

        public SetPos(new_pos: Vector2D) {
            this.m_vPosition = new Vector2D(new_pos.x, new_pos.y);
        }

        public BRadius() {
            return this.m_dBoundingRadius;
        }

        public SetBRadius(r: number) {
            this.m_dBoundingRadius = r;
        }

        public ID() {
            return this.m_ID;
        }

        //    public boolean IsTagged() {
        //        return m_bTag;
        //    }

        //    public void Tag() {
        //        m_bTag = true;
        //    }

        //    public void UnTag() {
        //        m_bTag = false;
        //    }

        //    public Vector2D Scale() {
        //        return new Vector2D(m_vScale);
        //    }

        //    public void SetScale(Vector2D val) {
        //        m_dBoundingRadius *= MaxOf(val.x, val.y) / MaxOf(m_vScale.x, m_vScale.y);
        //        m_vScale = new Vector2D(val);
        //    }

        //    public void SetScale(double val) {
        //        m_dBoundingRadius *= (val / MaxOf(m_vScale.x, m_vScale.y));
        //        m_vScale = new Vector2D(val, val);
        //    }

        //    public int EntityType() {
        //        return m_iType;
        //    }

        //    public void SetEntityType(int new_type) {
        //        m_iType = new_type;
        //    }
    }
}
