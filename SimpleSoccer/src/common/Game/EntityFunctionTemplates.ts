/**
 * @author Petr (http://www.sallyx.org/)
 */
//package common.Game;

//import SimpleSoccer.BaseGameEntity;
//import common.D2.Vector2;
//import static common.D2.Vector2.*;
//import static common.D2.geometry.*;
//import java.util.List;
//import java.util.ListIterator;
namespace SimpleSoccer {
    //public class EntityFunctionTemplates {
    //////////////////////////////////////////////////////////////////////////
    //
    //  Some useful template functions
    //
    //////////////////////////////////////////////////////////////////////////

    ///**
    // *  tests to see if an entity is overlapping any of a number of entities
    // *  stored in a std container
    // */
    //public static <T extends BaseGameEntity, conT extends List<? extends BaseGameEntity>>
    //        boolean Overlapped(final T ob, final conT conOb) {
    //    return Overlapped(ob, conOb, 40.0);
    //}

    //public static <T extends BaseGameEntity, conT extends List<? extends BaseGameEntity>>
    //        boolean Overlapped(final T ob, final conT conOb, double MinDistBetweenObstacles) {
    //    ListIterator<? extends BaseGameEntity> it = conOb.listIterator();

    //    while (it.hasNext()) {
    //        BaseGameEntity curOb = it.next();
    //        if (TwoCirclesOverlapped(ob.Pos(),
    //                ob.BRadius() + MinDistBetweenObstacles,
    //                curOb.Pos(),
    //                curOb.BRadius())) {
    //            return true;
    //        }
    //    }

    //    return false;
    //}

    ///**
    // * tags any entities contained in a std container that are within the
    // * radius of the single entity parameter
    // */
    //public static <T extends BaseGameEntity, conT extends List<? extends T>> 
    //        void TagNeighbors(T entity, conT others, final double radius) {
    //    ListIterator<? extends T> it = others.listIterator();

    //    //iterate through all entities checking for range
    //    while (it.hasNext()) {
    //        T curOb = it.next();
    //        //first clear any current tag
    //        curOb.UnTag();

    //        //work in distance squared to avoid sqrts
    //        Vector2 to = sub(curOb.Pos(), entity.Pos());

    //        //the bounding radius of the other is taken into account by adding it 
    //        //to the range
    //        double range = radius + curOb.BRadius();

    //        //if entity within range, tag for further consideration
    //        if ((curOb != entity) && (to.LengthSq() < range * range)) {
    //            curOb.Tag();
    //        }

    //    }//next entity
    //}

    /**
     * Given a pointer to an entity and a std container of pointers to nearby
     * entities, this function checks to see if there is an overlap between
     * entities. If there is, then the entities are moved away from each
     * other
     */
    export function EnforceNonPenetrationContraint<T extends BaseGameEntity>(entity: T, others: T[]) {
        //let it = others.listIterator();

        //iterate through all entities checking for any overlap of bounding
        //radii
        //while (it.hasNext()) {
        for (let it of others) {
            //let curOb = it.next();
            //make sure we don't check against this entity
            if (it === entity) {
                continue;
            }

            //calculate the distance between the positions of the entities
            let ToEntity = Vector2.subtract(entity.Pos(), it.Pos());

            let DistFromEachOther = ToEntity.length();

            //if this distance is smaller than the sum of their radii then this
            //entity must be moved away in the direction parallel to the
            //ToEntity vector   
            let AmountOfOverLap = it.BRadius() + entity.BRadius() - DistFromEachOther;

            if (AmountOfOverLap >= 0) {
                //move the entity a distance away equivalent to the amount of overlap.
                entity.SetPos(Vector2.add(entity.Pos(), Vector2.multiply(AmountOfOverLap, Vector2.divide(ToEntity, DistFromEachOther))));
            }
        }//next entity
    }
}