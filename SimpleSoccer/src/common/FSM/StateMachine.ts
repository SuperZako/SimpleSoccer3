///**
// * State machine class. Inherit from this class and create some 
// * states to give your agents FSM functionality
// * 
// * @author Petr (http://www.sallyx.org/)
// */
//package common.FSM;

//import common.Messaging.Telegram;

namespace SimpleSoccer {
    export class StateMachine<entity_type> {
        ////a pointer to the agent that owns this instance

        private m_pCurrentState: State<entity_type> = null;
        //a record of the last state the agent was in
        private m_pPreviousState: State<entity_type> = null;
        //this is called every time the FSM is updated
        private m_pGlobalState: State<entity_type> = null;

        public constructor(private owner: entity_type) {
        }

        //@Override
        protected finalize() {
            //    super.finalize();
        }

        //use these methods to initialize the FSM
        public SetCurrentState(s: State<entity_type>) {
            this.m_pCurrentState = s;
        }

        public SetGlobalState(s: State<entity_type>) {
            this.m_pGlobalState = s;
        }

        public SetPreviousState(s: State<entity_type>) {
            this.m_pPreviousState = s;
        }

        //call this to update the FSM
        public Update() {
            //if a global state exists, call its execute method, else do nothing
            if (this.m_pGlobalState !== null) {
                this.m_pGlobalState.Execute(this.owner);
            }

            //same for the current state
            if (this.m_pCurrentState !== null) {
                this.m_pCurrentState.Execute(this.owner);
            }
        }

        public HandleMessage(msg: Telegram) {
            //first see if the current state is valid and that it can handle
            //the message
            if (this.m_pCurrentState != null && this.m_pCurrentState.OnMessage(this.owner, msg)) {
                return true;
            }

            //if not, and if a global state has been implemented, send 
            //the message to the global state
            if (this.m_pGlobalState != null && this.m_pGlobalState.OnMessage(this.owner, msg)) {
                return true;
            }

            return false;
        }

        //change to a new state
        public ChangeState(pNewState: State<entity_type>) {
            //assert pNewState != null : "<StateMachine::ChangeState>: trying to change to NULL state";

            //keep a record of the previous state
            this.m_pPreviousState = this.m_pCurrentState;

            //call the exit method of the existing state
            this.m_pCurrentState.Exit(this.owner);

            //change state to the new state
            this.m_pCurrentState = pNewState;

            //call the entry method of the new state
            this.m_pCurrentState.Enter(this.owner);
        }

        ////change state back to the previous state
        //public void RevertToPreviousState() {
        //    ChangeState(m_pPreviousState);
        //}

        //returns true if the current state's type is equal to the type of the
        //class passed as a parameter. 
        public isInState(st: State<entity_type>) {
            //return this.m_pCurrentState/*.getClass()*/ == st/*.getClass()*/;
            return this.m_pCurrentState.getName() === st.getName();
        }

        public CurrentState() {
            return this.m_pCurrentState;
        }

        public GlobalState() {
            return this.m_pGlobalState;
        }

        //public State<entity_type> PreviousState() {
        //    return m_pPreviousState;
        //}
        ////only ever used during debugging to grab the name of the current state

        public GetNameOfCurrentState() {
            //let s = this.m_pCurrentState.getClass().getName().split("\\.");
            //let s = this.m_pCurrentState.getName().split("\\.");
            //if (s.length > 0) {
            //    return s[s.length - 1];
            //}
            return this.m_pCurrentState.getName();
        }
    }
}