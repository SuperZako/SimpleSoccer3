/**
 * @author Petr (http://www.sallyx.org/)
 */
//package common.Messaging;

//import SimpleSoccer.MessageTypes;
namespace SimpleSoccer {
    export class Telegram /*implements Comparable */ {
        //    //the entity that sent this telegram

        public Sender: number;
        //    //the entity that is to receive this telegram
        public Receiver: number;
        //    //the message itself. These are all enumerated in the file
        //    //"MessageTypes.h"
        public Msg: MessageTypes;
        //    //messages can be dispatched immediately or delayed for a specified amount
        //    //of time. If a delay is necessary this field is stamped with the time 
        //    //the message should be dispatched.
        public DispatchTime: number;
        //    //any additional information that may accompany the message
        public ExtraInfo: Object;

        //    public Telegram() {
        //        DispatchTime = -1;
        //        Sender = -1;
        //        Receiver = -1;
        //        Msg = null;
        //    }

        //    public Telegram(double time,
        //            int sender,
        //            int receiver,
        //            MessageTypes msg) {
        //        this(time, sender, receiver, msg, null);
        //    }

        constructor(time: number,
            sender: number,
            receiver: number,
            msg: MessageTypes,
            info: Object) {
            this.DispatchTime = time;
            this.Sender = sender;
            this.Receiver = receiver;
            this.Msg = msg;
            this.ExtraInfo = info;
        }
        ////these telegrams will be stored in a priority queue. Therefore the >
        ////operator needs to be overloaded so that the PQ can sort the telegrams
        ////by time priority. Note how the times must be smaller than
        ////SmallestDelay apart before two Telegrams are considered unique.
        //    public final static double SmallestDelay = 0.25;

        //    /**
        //     *  "overloads" == operaotr
        //     */
        //    @Override
        //    public boolean equals(Object o) {
        //        if (!(o instanceof Telegram)) {
        //            return false;
        //        }
        //        Telegram t1 = this;
        //        Telegram t2 = (Telegram) o;
        //        return (Math.abs(t1.DispatchTime - t2.DispatchTime) < SmallestDelay)
        //                && (t1.Sender == t2.Sender)
        //                && (t1.Receiver == t2.Receiver)
        //                && (t1.Msg == t2.Msg || (t1.Msg == null && t2.Msg == null));
        //    }

        //    /**
        //     *  It is generally necessary to override the hashCode method 
        //     *  whenever equals method is overridden, so as to maintain the 
        //     *  general contract for the hashCode method, which states that 
        //     *  equal objects must have equal hash codes.
        //     */
        //	@Override
        //public hashCode() {
        //    let hash = 7;
        //    hash = 53 * hash + this.Sender;
        //    hash = 53 * hash + this.Receiver;
        //    hash = 53 * hash + (this.Msg != null ? this.Msg.hashCode() : 0);
        //    let DispatchTime = this.DispatchTime - (this.DispatchTime % this.SmallestDelay);
        //    hash = 53 * hash + (Double.doubleToLongBits(DispatchTime) ^ (Double.doubleToLongBits(DispatchTime) >>> 32));
        //    hash = 97 * hash + (this.ExtraInfo == null ? 0 : this.ExtraInfo.hashCode());
        //    return hash;
        //}


        /**
         * "overloads" < and > operators
         */
        //@Override
        public compareTo(t1: Telegram, t2: Telegram) {
            ////let t1 = o1;
            ////let t2 = (Telegram) o2;
            //if (Math.abs(t1.DispatchTime - t2.DispatchTime) < SmallestDelay) {
            //    return t1.hashCode() - t2.hashCode(); // equals objects return 0
            //} else {
            //    return (t1.DispatchTime < t2.DispatchTime) ? -1 : 1;
            //}
            return (t1.DispatchTime < t2.DispatchTime) ? -1 : 1;
        }

        //    @Override
        //    public String toString() {
        //        return "time: " + DispatchTime + "  Sender: " + Sender
        //                + "   Receiver: " + Receiver + "   Msg: " + Msg;
        //    }

        //    /**
        //     * handy helper function for dereferencing the ExtraInfo field of the Telegram 
        //     * to the required type.
        //     */
        //    public static <T> T DereferenceToType(Object p) {
        //        return (T) (p);
        //    }
    }
}