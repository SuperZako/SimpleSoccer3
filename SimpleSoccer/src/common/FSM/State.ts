///**
// * abstract base class to define an interface for a state
// * 
// * @author Petr (http://www.sallyx.org/)
// */
//package common.FSM;

//import common.Messaging.Telegram;

namespace SimpleSoccer {
    export abstract class State<entity_type>  {

        //@Override
        //public void finalize() throws Throwable{ super.finalize();}


        public abstract getName(): string;

        //this will execute when the state is entered
        public abstract Enter(e: entity_type): void;

        //this is the state's normal update function
        public abstract Execute(e: entity_type): void;

        //this will execute when the state is exited. (My word, isn't
        //life full of surprises... ;o))
        public abstract Exit(e: entity_type): void;

        ////this executes if the agent receives a message from the 
        ////message dispatcher
        public abstract OnMessage(e: entity_type, t: Telegram): boolean;
    }
}