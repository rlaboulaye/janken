var app = window.angular.module('app', [])

app.factory('matchFetcher', matchFetcher)

function matchFetcher ($http) {
  var url = "matches";
  return {
    get: function() {
      return $http
        .get(url)
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
   }
  }
}

app.controller('mainCtrl',
  ['$scope', '$timeout', '$interval', '$q', 'matchFetcher',
  function mainCtrl ($scope, $timeout, $interval, $q, matchFetcher) {

    $scope.ROCK = 0;
    $scope.PAPER = 1;
    $scope.SCISSORS = 2;
    $scope.WIN = 1;
    $scope.TIE = 0;
    $scope.LOSE = -1;

    $scope.reset = function() {

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

      $scope.sign1;
      $scope.sign2;
      $scope.sign3;
      $scope.signOpponent1;
      $scope.signOpponent2;
      $scope.signOpponent3;

      $scope.match = [];

    }

    $scope.chooseRandom = function() {
      $scope.select = false;
      $scope.play();
    };

    $scope.chooseChallenge = function() {
      $scope.select = false;
      // Challenge mode will be implemented in final project
      //$scope.challengeMode = true;
      $scope.play();
    };

    $scope.enterInfo = function() {
      $scope.gender = 'M';
      $scope.age = 22;
    }

    $scope.getNextMove = function() {
      // Challenge mode will be implemented in final project
      if ($scope.challengeMode)
      {
        return 0;
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
              case -1:
                $scope.resultString = "You lose!"
                break;
              case 0:
                $scope.resultString = "It's a tie!"
                break;
              case 1:
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
        $scope.enterInfo();
        $scope.chooseSign = true;
        $scope.timer(7000);

        console.log("in play 0");
        $scope.round++;
      }
      else if ($scope.round == 10)
      {
        $scope.match.push({gender: $scope.gender, age: $scope.age, sign: $scope.sign, signOpponent: $scope.signOpponent, numSwitches: $scope.numSwitches, timeForDecision: $scope.timeForDecision, result: $scope.result});
        console.log($scope.match);
        matchFetcher.post($scope.match);
        var winAverage = 0;
        for (var i = 0; i < $scope.match.length; i++) {
          winAverage += $scope.match[i].result;
        }
        if (winAverage < 0)
        {
          $scope.matchString = "You lost to the Bot :(";
        }
        else if (winAverage > 0)
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
        $scope.match.push({gender: $scope.gender, age: $scope.age, sign: $scope.sign, signOpponent: $scope.signOpponent, numSwitches: $scope.numSwitches, timeForDecision: $scope.timeForDecision, result: $scope.result, sign1: $scope.sign1, sign2: $scope.sign2, sign3: $scope.sign3, signOpponent1: $scope.signOpponent1, signOpponent2: $scope.signOpponent2, signOpponent3: $scope.signOpponent3});
        console.log($scope.match);
        $scope.sign3 = $scope.sig2;
        $scope.sign2 = $scope.sign1;
        $scope.sign1 = $scope.sign;
        $scope.signOpponent3 = $scope.signOpponent2;
        $scope.signOpponent2 = $scope.signOpponent1;
        $scope.signOpponent1 = $scope.signOpponent;
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

      matchFetcher.get().then(function (data) {
          var matches = data;
          console.log(matches);

          for (var i = 0; i < matches.length; i++)
          {
            if (matches[i].result == 1)
            {
              $scope.totalVictories++;
            }
            else if (matches[i].result == -1)
            {
              $scope.totalLosses++;
            }
            $scope.totalGames++;
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

  }
]);
