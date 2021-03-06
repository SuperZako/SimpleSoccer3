/**
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer.FieldPlayerStates;

//import SimpleSoccer.FieldPlayer;
//import static SimpleSoccer.DEFINE.*;
//import common.D2.Vector2;
//import static common.Debug.DbgConsole.*;
//import common.FSM.State;
//import common.Messaging.Telegram;

namespace SimpleSoccer {
    export class Wait extends State<FieldPlayer> {

        private static instance = new Wait();

        constructor() {
            super();
        }

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "Wait";
        }

        //@Override
        public Enter(player: FieldPlayer) {
            //if (def(PLAYER_STATE_INFO_ON)) {
            //        debug_con.print("Player ").print(player.ID()).print(" enters wait state").print("");
            //}

            //if the game is not on make sure the target is the center of the player's
            //home region. This is ensure all the players are in the correct positions
            //ready for kick off
            if (!player.Pitch().GameOn()) {
                player.Steering().SetTarget(player.HomeRegion().Center());
            }
        }

        //@Override
        public Execute(player: FieldPlayer) {
            //if the player has been jostled out of position, get back in position  
            if (!player.AtTarget()) {
                player.Steering().ArriveOn();

                return;
            } else {
                player.Steering().ArriveOff();

                player.SetVelocity(new Vector2(0, 0));

                //the player should keep his eyes on the ball!
                player.TrackBall();
            }

            //if this player's team is controlling AND this player is not the attacker
            //AND is further up the field than the attacker he should request a pass.
            if (player.Team().InControl()
                && (!player.isControllingPlayer())
                && player.isAheadOfAttacker()) {
                player.Team().RequestPass(player);

                return;
            }

            if (player.Pitch().GameOn()) {
                //if the ball is nearer this player than any other team member  AND
                //there is not an assigned receiver AND neither goalkeeper has
                //the ball, go chase it
                if (player.isClosestTeamMemberToBall()
                    && player.Team().Receiver() == null
                    && !player.Pitch().GoalKeeperHasBall()) {
                    player.ChangeState(ChaseBall.Instance());

                    return;
                }
            }
        }

        //@Override
        public Exit(player: FieldPlayer) {
            return;
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}