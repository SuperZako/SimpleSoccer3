/**
 * Desc:   Singleton class to handle the  management of Entities.          
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package common.Game;

//import SimpleSoccer.BaseGameEntity;
//import java.util.HashMap;
namespace SimpleSoccer {
    export class EntityManager {
        //provide easy access

        public static EntityMgr = new EntityManager();

        //private /*class*/ EntityMap extends HashMap<Integer, BaseGameEntity> {
        //    }
        //    //to facilitate quick lookup the entities are stored in a std::map, in which
        //    //pointers to entities are cross referenced by their identifying number
        private m_EntityMap: { [index: number]: BaseGameEntity } = {};

        //    private EntityManager() {
        //    }

        ////copy ctor and assignment should be private
        //    private EntityManager(final EntityManager m) {
        //    }

        //--------------------------- Instance ----------------------------------------
        //   this class is a singleton
        //-----------------------------------------------------------------------------
        public static Instance() {
            return this.EntityMgr;
        }

        /**
         * this method stores a pointer to the entity in the std::vector
         * m_Entities at the index position indicated by the entity's ID
         * (makes for faster access)
         */
        public RegisterEntity(NewEntity: BaseGameEntity) {
            this.m_EntityMap[NewEntity.ID()] = NewEntity;
        }

        /**
         * @return a pointer to the entity with the ID given as a parameter
         */
        public GetEntityFromID(id: number) {
            //find the entity
            let ent = this.m_EntityMap[id];

            //assert that the entity is a member of the map
            //assert (ent != null) : "<EntityManager::GetEntityFromID>: invalid ID";

            return ent;
        }

        //    /**
        //     * this method removes the entity from the list
        //     */
        //    public void RemoveEntity(BaseGameEntity pEntity) {
        //        m_EntityMap.remove(pEntity.ID());
        //    }

        //    /**
        //     * clears all entities from the entity map
        //     */
        //    public void Reset() {
        //        m_EntityMap.clear();
        //    }
    }
}