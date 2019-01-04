import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Touchable from 'react-native-platform-touchable';
import Aicon from 'react-native-vector-icons/FontAwesome';
import GameBuilder from './GameBuilder';
import { colors } from '../../../utils/theme';
import debug from '../../../utils/debug';
import styles from './styles';

import LocalStorage from '../../../../lib/Categories/LocalStorage';


class Games extends React.PureComponent {
  static propTypes = {
    screenProps: PropTypes.shape({
      navigation: PropTypes.shape({
        navigate: PropTypes.func,
      }),
    }),
  };
  
  static defaultProps = {
    screenProps: {
      navigation: {
        navigate: () => {},
      },
    },
  };
  
  constructor(props) {
    super(props);

    this.state = {
      openGame: null,
      games: [],
    };

    this.currentGame = null;

    this.handleCloseGame = this.handleCloseGame.bind(this);
    this.handleCreateGame = this.handleCreateGame.bind(this);
    this.handleOpenGame = this.handleOpenGame.bind(this);
  }


  componentDidMount() {
    this.hydrateGames();
  }
  
  
  async hydrateGames() {
    let games;
    try {
      games = await LocalStorage.getItem('@RightOn:Games');
      if (games === undefined) {
        LocalStorage.setItem('@RightOn:Games', JSON.stringify([]));
        // TODO! Handle when user is logged in with different account??
        games = [];
      } else {
        games = JSON.parse(games);
      }
      // if (__DEV__) {
      //   games = [{ image: '', title: 'Hello world' },
      //     { image: '', title: 'How are you?' },
      //     { image: '', title: 'Take a walk with me!' },
      //     { image: '', title: 'How nice it is today..' },
      //     { image: '', title: 'Like all of future past.' }
      //   ];
      // }
    } catch (exception) {
      debug.log('Caught exception getting item from LocalStorage @Games, hydrateGames():', exception);
    }
    this.setState({ games });
  }


  handleOpenGame(event, game = {}, idx) {
    this.currentGame = idx;
    this.setState({ openGame: game });
  }


  handleCloseGame() {
    this.setState({ openGame: null });
    this.currentGame = null;
  }


  handleCreateGame(game) {
    const { games } = this.state;
    if (this.currentGame === null) {
      const updatedGames = [...games, game];
      this.setState({ games: updatedGames, openGame: null });
      this.saveGamesToDatabase(updatedGames);
    } else {
      const updatedGames = [...games];
      updatedGames.splice(this.currentGame, 1, game);
      this.setState({ games: updatedGames, openGame: null });
      this.saveGamesToDatabase(updatedGames);
    }
  }


  saveGamesToDatabase = (updatedGames) => {
    const stringifyGames = JSON.stringify(updatedGames);
    LocalStorage.setItem('@RightOn:Games', stringifyGames);
  }


  renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Games</Text>
      <Touchable
        activeOpacity={0.8}
        hitSlop={{ top: 5, right: 5, bottom: 5, left: 5 }}
        onPress={this.handleOpenGame}
        style={styles.plusButton}
      >
        <Aicon name={'plus'} style={styles.plusIcon} />
      </Touchable>
    </View>
  );


  renderGameBlock(game, idx) {
    return (
      <Touchable
        activeOpacity={0.8}
        background={Touchable.Ripple(colors.dark, false)}
        hitSlop={{ top: 5, right: 5, bottom: 5, left: 5 }}
        key={game.title}
        onPress={() => this.handleOpenGame(null, game, idx)}
      >
        <View style={styles.gameButton}>
          <View style={styles.imageContainer}>
            {game.image ?
              <Image source={{ uri: game.image }} style={styles.image} />
              :
              <Text style={styles.imageLabel}>RightOn!</Text>}
          </View>
          <Text style={styles.gameTitle}>{ game.title }</Text>
          <Text style={[styles.gameTitle, styles.gameDescription]}>{ game.description }</Text>
          <Text style={styles.gameCount}>{ `${game.questions.length}Q` }</Text>
        </View>
      </Touchable>
    );
  }


  renderGames() {
    const { games } = this.state;
    return (
      <ScrollView contentContainerStyle={styles.scrollview}>
        {games.map((game, idx) => this.renderGameBlock(game, idx))}
      </ScrollView>
    );
  }


  render() {
    const { openGame } = this.state;
    // const { navigation } = this.props.screenProps;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} />
        {openGame &&
          <GameBuilder
            currentGame={this.currentGame}
            handleClose={this.handleCloseGame}
            handleCreateGame={this.handleCreateGame}
            game={openGame}
            visible
          />}
        {this.renderHeader()}
        {this.renderGames()}
      </View>
    );
  }
}


export default props => <Games screenProps={{ ...props }} />;
