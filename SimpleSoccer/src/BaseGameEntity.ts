// <reference path="./common/math/Vector2.ts" />

/**
 * Desc: Base class to define a common interface for all game
 *       entities
 * 
 * @author Petr (http://www.sallyx.org/)
 */

namespace SimpleSoccer {
    export abstract class BaseGameEntity {

        public static default_entity_type = -1;

        private static nextValidID = 0;

        //its location in the environment
        protected position = new Vector2();
        protected scale = Vector2.One;
        //the magnitude of this object's bounding radius
        protected boundingRadius = 0.0;

        //each entity has a unique ID
        private id: number;
        //every entity has a type associated with it (health, troll, ammo etc)
        private type = BaseGameEntity.default_entity_type;
        //    //this is a generic flag. 
        private tag = false;
        //    //this is the next valid ID. Each time a BaseGameEntity is instantiated
        //    //this value is updated

        //------------------------------ ctor -----------------------------------------
        constructor(id: number) {
            this.SetID(id);
        }

        // use this to grab the next valid ID
        public static GetNextValidID() {
            return this.nextValidID;
        }



        public Update() {
            return;
        }

        public abstract Render(ctx: CanvasRenderingContext2D): void;

        public abstract HandleMessage(msg: Telegram): boolean;

        //    //entities should be able to read/write their data to a stream
        //    //virtual void Write(std::ostream&  os)const{}
        //    //virtual void Read (std::ifstream& is){}


        //    //this can be used to reset the next ID
        //    public static void ResetNextValidID() {
        //        m_iNextValidID = 0;
        //    }

        public Pos() {
            return new Vector2(this.position.x, this.position.y);
        }

        public SetPos(new_pos: Vector2) {
            this.position = new Vector2(new_pos.x, new_pos.y);
        }

        public BRadius() {
            return this.boundingRadius;
        }

        public SetBRadius(r: number) {
            this.boundingRadius = r;
        }

        public ID() {
            return this.id;
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

        //    public Vector2 Scale() {
        //        return new Vector2(m_vScale);
        //    }

        //    public void SetScale(Vector2 val) {
        //        m_dBoundingRadius *= MaxOf(val.x, val.y) / MaxOf(m_vScale.x, m_vScale.y);
        //        m_vScale = new Vector2(val);
        //    }

        //    public void SetScale(double val) {
        //        m_dBoundingRadius *= (val / MaxOf(m_vScale.x, m_vScale.y));
        //        m_vScale = new Vector2(val, val);
        //    }

        //    public int EntityType() {
        //        return m_iType;
        //    }

        //    public void SetEntityType(int new_type) {
        //        m_iType = new_type;
        //    }

        // @Override
        protected finalize() {
            //super.finalize();
        }

        /**
         *  this must be called within each constructor to make sure the ID is set
         *  correctly. It verifies that the value passed to the method is greater
         *  or equal to the next valid ID, before setting the ID and incrementing
         *  the next valid ID
        */
        private SetID(id: number) {
            //make sure the val is equal to or greater than the next available ID
            //assert (val >= m_iNextValidID) : "<BaseGameEntity::SetID>: invalid ID";

            this.id = id;

            BaseGameEntity.nextValidID = this.id + 1;
        }
    }
}
