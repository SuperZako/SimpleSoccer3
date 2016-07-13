/// <reference path="../misc/utils.ts" />

/**
 *  Desc:   Use this class to regulate code flow (for an update function say)
 *          Instantiate the class with the frequency you would like your code
 *          section to flow (like 10 times per second) and then only allow 
 *          the program flow to continue if Ready() returns true
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package common.Time;

//import static common.misc.utils.*;
namespace SimpleSoccer {
    export class Regulator {
        ////the number of milliseconds the update period can vary per required
        ////update-step. This is here to make sure any multiple clients of this class
        ////have their updates spread evenly
        private static UpdatePeriodVariator = 10.0;

        //the time period between updates 
        private m_dUpdatePeriod: number;
        //the next time the regulator allows code flow
        private m_dwNextUpdateTime: number;

        public constructor(NumUpdatesPerSecondRqd: number) {
            this.m_dwNextUpdateTime = (new Date().getTime() + RandFloat() * 1000);

            if (NumUpdatesPerSecondRqd > 0) {
                this.m_dUpdatePeriod = 1000.0 / NumUpdatesPerSecondRqd;
            } else if (isEqual(0.0, NumUpdatesPerSecondRqd)) {
                this.m_dUpdatePeriod = 0.0;
            } else if (NumUpdatesPerSecondRqd < 0) {
                this.m_dUpdatePeriod = -1;
            }
        }


        /**
         * @return true if the current time exceeds m_dwNextUpdateTime
         */
        public isReady() {
            //if a regulator is instantiated with a zero freq then it goes into
            //stealth mode (doesn't regulate)
            if (isEqual(0.0, this.m_dUpdatePeriod)) {
                return true;
            }

            //if the regulator is instantiated with a negative freq then it will
            //never allow the code to flow
            if (this.m_dUpdatePeriod < 0) {
                return false;
            }

            let CurrentTime = new Date().getTime(); // System.currentTimeMillis();

            if (CurrentTime >= this.m_dwNextUpdateTime) {
                const updatePeriodVariator = Regulator.UpdatePeriodVariator;
                this.m_dwNextUpdateTime = (CurrentTime + this.m_dUpdatePeriod + RandInRange(-updatePeriodVariator, updatePeriodVariator));
                return true;
            }

            return false;
        }
    }
}