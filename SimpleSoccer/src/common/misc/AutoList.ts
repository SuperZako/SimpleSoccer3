///**
// * @author Petr (http://www.sallyx.org/)
// */
//package common.misc;

//import java.util.HashMap;
//import java.util.LinkedList;
//import java.util.List;
//import java.util.Map;

namespace SimpleSoccer {
    // Unfortunatelly this class is not "Auto"
    // You have to call add()/remove() method in your class
    export class AutoList<T extends Object> {

        //// just for tagging class witch use AutoList
        //public static interface Interface {}

        //static m_Members = <T[]>[]
        //private Class<?> classType = null;

        //private List<T> getList(Class<?> type) {
        //    if (type == null) {
        //        return null;
        //    }
        //    if (!m_Members.containsKey(type)) {
        //        classType = type;
        //        m_Members.put(type, new LinkedList<T>());
        //    }

        //    return (List<T>) m_Members.get(type);
        //}

        //public AutoList() {}

        //public add(o: T) {

        //    //getList(o.getClass()).add(o);
        //}

        //public void remove(T o) {
        //    getList(o.getClass()).remove(o);
        //}

        //public List<T> GetAllMembers() {
        //    List<T> list = getList(classType);
        //    if (list != null) {
        //        return list;
        //    }
        //    return new LinkedList<T>();
        //}
    }
}