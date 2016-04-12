var app = window.angular.module('app', [])

app.factory('matchFetcher', matchFetcher)

function matchFetcher ($http) {
  var url = "match";
  return {
    getAll: function() {
      return $http
        .get(url + 'es')
        .then(function (resp) {
          console.log("Get Worked");
          return resp.data;
        })
    },
    get: function(username) {
      return $http
      .get(url + '/' + username)
      .then(function(resp) {
        console.log(resp);
        return resp.data;
      })
    },
    post: function (formData) {
      return $http
     .post(url + 'es',formData)
     .then(function (resp) {
       console.log("Post worked");
     })
   }
  }
}

app.factory('userFetcher', userFetcher)

function userFetcher ($http) {
  var url = "user";
  return {
    get: function(username) {
      return $http
        .get(url + '/' + username)
        .then(function (resp) {
          console.log("Get Worked");
          return resp.data;
        })
    },
    getAll: function() {
      return $http
        .get(url + 's')
        .then(function (resp) {
          console.log("Get Worked");
          return resp.data;
        })
    },
    post: function (formData) {
      return $http
     .post(url,formData)
     .then(function (resp) {
       console.log("Post worked");
     })
   },
   incrementMatches: function(name) {
     return $http
     .put(url + '/' + name + '/increment')
     .then(function (resp) {
       console.log("Put worked");
     })
   },
   hash: function (password) {
     return $http
     .get('hash/' + password)
     .then(function (resp) {
       return resp.data;
     }, function (err) {
       return "ERROR";
     })
   }
  }
}

app.controller('mainCtrl',
  ['$scope', '$timeout', '$interval', '$q', 'matchFetcher', 'userFetcher',
  function mainCtrl ($scope, $timeout, $interval, $q, matchFetcher, userFetcher) {

    $scope.ROCK = 0;
    $scope.PAPER = 1;
    $scope.SCISSORS = 2;
    $scope.WIN = 2;
    $scope.TIE = 1;
    $scope.LOSE = 0;

    $scope.reset = function() {

      $scope.showLogin = false;
      $scope.showRegister = false;
      $scope.select = true;
      $scope.chooseSign = false;
      $scope.gameResult = false;
      $scope.matchResult = false;
      $scope.winLossRecord = false;
      $scope.informationScreen = false;

      $scope.resultString = "";
      $scope.matchString = "";
      $scope.showString = false;
      $scope.showSigns = false;
      $scope.signImg;
      $scope.signOpponentImg;

      $scope.challengeMode = false;

      $scope.totalVictories = 0;
      $scope.totalGames = 0;
      $scope.totalLosses = 0;

      $scope.gender;
      $scope.age;
      $scope.round = 0;

      $scope.timeForDecision = 0;
      $scope.timeRunning = 0;
      $scope.timeSeconds;
      $scope.timeMS;
      $scope.numSwitches = -1;

      $scope.sign;
      $scope.signOpponent;
      $scope.result;

      $scope.firstMatrix = [0, 0, 0];
      $scope.resultMatrix = [[[0, 0, 0],[0, 0, 0],[0, 0, 0]],[[0, 0, 0],[0, 0, 0],[0, 0, 0]],[[0, 0, 0],[0, 0, 0],[0, 0, 0]]];
      $scope.changeMatrix = [[[0, 0, 0],[0, 0, 0],[0, 0, 0]],[[0, 0, 0],[0, 0, 0],[0, 0, 0]],[[0, 0, 0],[0, 0, 0],[0, 0, 0]]];
      $scope.match = {games: []};

    }

    $scope.toRegister = function() {
      $scope.showLogin = false;
      $scope.showRegister = true;
    };

    $scope.toLogin = function() {
      $scope.showRegister = false;
      $scope.showLogin = true;
    };

    $scope.signUp = function() {
      userFetcher.getAll().then(function(data) {
        index = -1;
        for (i = 0; i < data.length; i++) {
          if (data[i].username == $scope.username)
          {
            index = i;
          }
        }
        if (index == -1) {
          userFetcher.hash($scope.password).then(function(data) {
            userFetcher.post({username: $scope.username, password: data.hash });
            $scope.toLogin();
          });
        } else {
          alert("This username has already been claimed.");
        }
      });
    };

    $scope.logIn = function() {
      userFetcher.getAll().then(function(data) {
        index = -1;
        for (i = 0; i < data.length; i++) {
          if (data[i].username == $scope.username) {
            $scope.checkPassword(data[i].password);
            index = i;
          }
        }
        if (index == -1) {
          alert('Invalid username');
        }
      });
    };

    $scope.checkPassword = function(password) {
      userFetcher.hash($scope.password).then(function(result) {
        if (result.hash == password) {
          $scope.showLogin = false;
          $scope.select = true;
        }
        else {
          alert('Invalid password');
        }
      });
    };

    $scope.chooseRandom = function() {
      $scope.select = false;
      $scope.play();
    };

    $scope.chooseChallenge = function() {
      userFetcher.get($scope.username).then(function(data) {
        $scope.matchesPlayed = data.matches;
        if (data.matches >= 5) {
          $scope.createMatrix();
        }
        $scope.select = false;
        $scope.challengeMode = true;
        $scope.play();
      });
    };

    $scope.createMatrix = function() {
      matchFetcher.get($scope.username).then(function(data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          var firstMove = data[i].games[0].sign;
          $scope.firstMatrix[firstMove] += 1 / data.length;
          for (var j = 3; j < data[i].games.length; j++) {
            var lastLastResult = data[i].games[j-2].result;
            var lastResult = data[i].games[j-1].result;
            var lastLastDirection = (data[i].games[j-2].sign - data[i].games[j-3].sign + 3) % 3;
            var lastDirection = (data[i].games[j-1].sign - data[i].games[j-2].sign + 3) % 3;
            var direction = (data[i].games[j].sign - data[i].games[j-1].sign + 3) % 3;

            $scope.resultMatrix[lastLastResult][lastResult][direction] += 1;
            $scope.changeMatrix[lastLastDirection][lastDirection][direction] += 1;
          }
        }
        for (var i = 0; i < $scope.resultMatrix.length; i++) {
          for (var j = 0; j < $scope.resultMatrix[i].length; j++) {
            var length = 0;
            for (var k = 0; k < $scope.resultMatrix[i][j].length; k++) {
              length += $scope.resultMatrix[i][j][k];
            }
            if (length == 0) {
              for (var k = 0; k < $scope.resultMatrix[i][j].length; k++) {
                $scope.resultMatrix[i][j][k] = 1 / $scope.resultMatrix[i][j].length;
              }
            } else {
              for (var k = 0; k < $scope.resultMatrix[i][j].length; k++) {
                $scope.resultMatrix[i][j][k] = $scope.resultMatrix[i][j][k] / length;
              }
            }
          }
        }
        for (var i = 0; i < $scope.changeMatrix.length; i++) {
          for (var j = 0; j < $scope.changeMatrix[i].length; j++) {
            var length = 0;
            for (var k = 0; k < $scope.changeMatrix[i][j].length; k++) {
              length += $scope.changeMatrix[i][j][k];
            }
            if (length == 0) {
              for (var k = 0; k < $scope.changeMatrix[i][j].length; k++) {
                $scope.changeMatrix[i][j][k] = 1 / $scope.changeMatrix[i][j].length;
              }
            } else {
              for (var k = 0; k < $scope.changeMatrix[i][j].length; k++) {
                $scope.changeMatrix[i][j][k] = $scope.changeMatrix[i][j][k] / length;
              }
            }
          }
        }
        console.log($scope.firstMatrix);
        console.log($scope.resultMatrix);
        console.log($scope.changeMatrix);
      });
    };

    $scope.getNextMove = function() {
      if ($scope.challengeMode)
      {
        if ($scope.matchesPlayed >= 5) {
          console.log('use challenge mode');
          if ($scope.round == 1) {
            var predictedMove = 0;

            var rand = Math.random();
            if (rand < $scope.firstMatrix[0])
            {
              predictedMove = 0;
            }
            else if (rand < ($scope.firstMatrix[0] + $scope.firstMatrix[1]))
            {
              predictedMove = 1;
            }
            else
            {
              predictedMove = 2;
            }
            return ((predictedMove + 1) % 3);
          }
          else if ($scope.round < 4) {
            return parseInt(Math.random() * 3);
          }
          else {
            console.log($scope.match.games);
            var lastLastResult = $scope.match.games[$scope.round - 3].result;
            var lastResult = $scope.match.games[$scope.round - 2].result;
            var lastLastDirection = ($scope.match.games[$scope.round - 3].sign - $scope.match.games[$scope.round - 4].sign + 3) % 3;
            var lastDirection = ($scope.match.games[$scope.round - 2].sign - $scope.match.games[$scope.round - 3].sign + 3) % 3;
            var predictionArray = [0, 0, 0];
            predictionArray[0] = ($scope.resultMatrix[lastLastResult][lastResult][0] * .7) + ($scope.changeMatrix[lastLastDirection][lastDirection][0] * .3);
            predictionArray[1] = ($scope.resultMatrix[lastLastResult][lastResult][1] * .7) + ($scope.changeMatrix[lastLastDirection][lastDirection][1] * .3);
            predictionArray[2] = ($scope.resultMatrix[lastLastResult][lastResult][2] * .7) + ($scope.changeMatrix[lastLastDirection][lastDirection][2] * .3);

            console.log(predictionArray);
            var prediction = 0;

            var rand = Math.random();
            console.log('rand ' + rand);
            if (rand < predictionArray[0])
            {
              prediction = 0;
            }
            else if (rand < (predictionArray[0] + predictionArray[1]))
            {
              prediction = 1;
            }
            else
            {
              prediction = -1;
            }
            console.log(lastLastResult);
            console.log(lastResult);
            console.log(lastLastDirection);
            console.log(lastDirection);
            console.log('prediction ' + prediction);
            return (($scope.match.games[$scope.round - 2].sign + prediction) % 3);
          }
        }
        else {
          return parseInt(Math.random() * 3);
        }
      }
      else
      {
        return parseInt(Math.random() * 3);
      }
    };

    $scope.hoverSign = function() {
      $scope.numSwitches++;
    };

    $scope.selectSign = function(sign) {
      if(angular.isDefined(timeout))
      {
        $timeout.cancel(timeout);
      }
      if (angular.isDefined(interval))
      {
        $interval.cancel(interval);
      }
      $scope.timeForDecision = $scope.timeRunning;
      $scope.timeRunning = 0;
      console.log($scope.timeForDecision);

      $scope.sign = sign;
      $scope.chooseSign = false;
      $scope.displayResult();
    };

    $scope.displayResult = function() {

      $scope.signOpponent = $scope.getNextMove();
      var difference = $scope.sign - $scope.signOpponent;
      console.log("you: " + $scope.sign + " opponent: " + $scope.signOpponent);
      if (difference == 0)
      {
        $scope.result = $scope.TIE;
      }
      else if ((difference == 1) || (difference == -2))
      {
        $scope.result = $scope.WIN;
      }
      else
      {
        $scope.result = $scope.LOSE;
      }

      var intervalCount = 0;
      interval = $interval(function() {
        switch (intervalCount) {
          case 1:
            $scope.resultString = "ROCK";
            $scope.showString = true;
            break;
          case 3:
            $scope.resultString = "PAPER";
            $scope.showString = true;
            break;
          case 5:
            $scope.resultString = "SCISSORS";
            $scope.showString = true;
            break;
          case 7:
            switch ($scope.result) {
              case 0:
                $scope.resultString = "You lose!"
                break;
              case 1:
                $scope.resultString = "It's a tie!"
                break;
              case 2:
                $scope.resultString = "You win!"
                break;
            }
            switch ($scope.sign) {
              case $scope.ROCK:
                $scope.signImg = "images/rock.png";
                break;
              case $scope.PAPER:
                $scope.signImg = "images/paper.png";
                break;
              case $scope.SCISSORS:
                $scope.signImg = "images/scissors.png";
                break;
            }
            switch ($scope.signOpponent) {
              case $scope.ROCK:
                $scope.signOpponentImg = "images/rock.png";
                break;
              case $scope.PAPER:
                $scope.signOpponentImg = "images/paper.png";
                break;
              case $scope.SCISSORS:
                $scope.signOpponentImg = "images/scissors.png";
                break;
            }
            $scope.showSigns = true;
            break;
          case 8:
            break;
          case 9:
            break;
          case 10:
            break;
          case 11:
            $scope.showSigns = false;
            $scope.showString = true;
            break;
          default:
            $scope.showString = false;
            $scope.showSigns = false;
        }
        intervalCount++;
      }, 250, 12);
      $scope.gameResult = true;
      $timeout(function() {$scope.play();}, 5000);
    };

    $scope.play = function() {
      $scope.showString = false;
      $scope.gameResult = false;
      $scope.matchResult = false;
      if ($scope.round == 0)
      {
        $scope.chooseSign = true;
        $scope.timer(7000);

        console.log("in play 0");
        $scope.round++;
      }
      else if ($scope.round == 10)
      {
        $scope.match.games.push({sign: $scope.sign, signOpponent: $scope.signOpponent, numSwitches: $scope.numSwitches, timeForDecision: $scope.timeForDecision, result: $scope.result});
        $scope.match.username = $scope.username;
        console.log($scope.match);
        matchFetcher.post($scope.match);
        userFetcher.incrementMatches($scope.username);
        var winAverage = 0;
        for (var i = 0; i < $scope.match.games.length; i++) {
          winAverage += $scope.match.games[i].result;
        }
        if (winAverage < 10)
        {
          $scope.matchString = "You lost to the Bot :(";
        }
        else if (winAverage > 10)
        {
          $scope.matchString = "You beat the Bot :)";
        }
        else
        {
          $scope.matchString = "You tied with the Bot";
        }
        winAverage = 0;
        $scope.matchResult = true;
        // display whatever
        timeout = $timeout(function() {
          $scope.reset();
        }, 5000);
      }
      else
      {
        $scope.match.games.push({sign: $scope.sign, signOpponent: $scope.signOpponent, numSwitches: $scope.numSwitches, timeForDecision: $scope.timeForDecision, result: $scope.result});
        console.log($scope.match);
        $scope.numSwitches = -1;

        $scope.chooseSign = true;
        console.log("next round");
        $scope.timer(7000);
        $scope.round++;
      }
    };

    var interval;
    var timeout;

    $scope.timer = function(duration) {

      interval = $interval(function() {
                  $scope.timeRunning = $scope.timeRunning + 10;
                  $scope.timeSeconds = Math.floor($scope.timeRunning / 1000);
                  $scope.timeMS = Math.floor(($scope.timeRunning - ($scope.timeSeconds * 1000)) / 10);
                }, 10);

      timeout = $timeout(function () {
                  console.log("timeout");
                  if (angular.isDefined(interval)) {
                    $interval.cancel(interval);
                  }
                  alert("Out of time. You lose!");
                  $scope.reset();
                }, duration);
    };

    $scope.showRecord = function() {

      $scope.totalVictories = 0;
      $scope.totalGames = 0;
      $scope.totalLosses = 0;

      matchFetcher.get($scope.username).then(function (data) {
          var matches = data;
          console.log(matches);

          for (var i = 0; i < matches.length; i++)
          {
            for (var j = 0; j < matches[i].games.length; j++) {
              if (matches[i].games[j].result == 2)
              {
                $scope.totalVictories++;
              }
              else if (matches[i].games[j].result == 0)
              {
                $scope.totalLosses++;
              }
              $scope.totalGames++;
            }
          }

          $scope.winLossRecord = true;
          $scope.select = false;
      });
    };

    $scope.hideRecord = function() {
      $scope.select = true;
      $scope.winLossRecord = false;
    };

    $scope.reset();
    $scope.username = '';
    $scope.password = '';
    $scope.select = false;
    $scope.showLogin = true;

  }
]);
