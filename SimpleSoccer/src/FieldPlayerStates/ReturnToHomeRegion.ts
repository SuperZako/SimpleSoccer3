/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.FieldPlayerStates;

//import static SimpleSoccer.DEFINE.*;
//import SimpleSoccer.FieldPlayer;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Game.Region;
//import common.Messaging.Telegram;
namespace SimpleSoccer {
    export class ReturnToHomeRegion extends State<FieldPlayer> {

        private static instance = new ReturnToHomeRegion();

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "ReturnToHomeRegion";
        }

        //@Override
        public Enter(player: FieldPlayer) {
            player.Steering().ArriveOn();

            if (!player.HomeRegion().Inside(player.Steering().Target(), RegionModifier.HalfSize)) {
                player.Steering().SetTarget(player.HomeRegion().Center());
            }

            //if (def(PLAYER_STATE_INFO_ON)) {
            //    debug_con.print("Player ").print(player.ID()).print(" enters ReturnToHome state").print("");
            //}
        }

        //@Override
        public Execute(player: FieldPlayer) {
            if (player.Pitch().GameOn()) {
                //if the ball is nearer this player than any other team member  &&
                //there is not an assigned receiver && the goalkeeper does not gave
                //the ball, go chase it
                if (player.isClosestTeamMemberToBall() && (player.Team().Receiver() == null) && !player.Pitch().GoalKeeperHasBall()) {
                    player.ChangeState(ChaseBall.Instance());

                    return;
                }
            }

            //if game is on and close enough to home, change state to wait and set the 
            //player target to his current position.(so that if he gets jostled out of 
            //position he can move back to it)
            if (player.Pitch().GameOn() && player.HomeRegion().Inside(player.Pos(), RegionModifier.HalfSize)) {
                player.Steering().SetTarget(player.Pos());
                player.ChangeState(Wait.Instance());
            } else if (!player.Pitch().GameOn() && player.AtTarget()) {
                //if game is not on the player must return much closer to the center of his
                //home region
                player.ChangeState(Wait.Instance());
            }
        }

        //@Override
        public Exit(player: FieldPlayer) {
            player.Steering().ArriveOff();
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}