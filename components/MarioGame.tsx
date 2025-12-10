"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX?: number;
  velocityY?: number;
}

interface Player extends GameObject {
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  facingRight: boolean;
  lives: number;
  invincible: boolean;
}

interface Coin extends GameObject {
  collected: boolean;
}

interface Enemy extends GameObject {
  velocityX: number;
  velocityY: number;
  direction: number;
}

interface Platform extends GameObject {
  color: string;
}

type GameState = "menu" | "playing" | "paused" | "gameover" | "won";

export default function MarioGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const gameStateRef = useRef<{
    player: Player;
    platforms: Platform[];
    coins: Coin[];
    enemies: Enemy[];
    keys: { [key: string]: boolean };
    touchControls: { left: boolean; right: boolean; jump: boolean };
    canvas: { width: number; height: number };
    camera: { x: number; y: number };
    levelWidth: number;
  }>({
    player: {
      x: 100,
      y: 100,
      width: 32,
      height: 32,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      facingRight: true,
      lives: 3,
      invincible: false,
    },
    platforms: [],
    coins: [],
    enemies: [],
    keys: {},
    touchControls: { left: false, right: false, jump: false },
    canvas: { width: 800, height: 600 },
    camera: { x: 0, y: 0 },
    levelWidth: 5000,
  });

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("marioHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Initialize level
  const initializeLevel = useCallback(() => {
    const platforms: Platform[] = [];
    const coins: Coin[] = [];
    const enemies: Enemy[] = [];
    const levelWidth = 5000;

    // Ground
    platforms.push({ x: 0, y: 550, width: levelWidth, height: 50, color: "#8B4513" });

    // Create platforms throughout the level
    for (let i = 0; i < 50; i++) {
      const x = 200 + i * 250;
      const y = 450 - (i % 3) * 80;
      const width = 100 + Math.random() * 100;
      platforms.push({ x, y, width, height: 20, color: "#2ecc71" });
    }

    // Starting platform
    platforms.push({ x: 50, y: 500, width: 150, height: 20, color: "#2ecc71" });

    // Create staircase pattern
    for (let i = 0; i < 5; i++) {
      platforms.push({
        x: 300 + i * 120,
        y: 480 - i * 60,
        width: 100,
        height: 20,
        color: "#27ae60"
      });
    }

    // Mid-level platforms
    for (let i = 0; i < 20; i++) {
      const x = 1000 + i * 300;
      const y = 250 + Math.sin(i) * 100;
      platforms.push({ x, y, width: 120, height: 20, color: "#3498db" });
    }

    // End platform
    platforms.push({
      x: levelWidth - 300,
      y: 400,
      width: 250,
      height: 20,
      color: "#f39c12"
    });

    // Create coins
    for (let i = 0; i < 100; i++) {
      const x = 300 + i * 120;
      const y = 200 + Math.sin(i * 0.5) * 150;
      coins.push({ x, y, width: 20, height: 20, collected: false });
    }

    // Create enemies
    for (let i = 0; i < 15; i++) {
      const x = 500 + i * 400;
      const y = 500;
      enemies.push({
        x,
        y,
        width: 30,
        height: 30,
        velocityX: 1,
        velocityY: 0,
        direction: 1
      });
    }

    gameStateRef.current.platforms = platforms;
    gameStateRef.current.coins = coins;
    gameStateRef.current.enemies = enemies;
    gameStateRef.current.levelWidth = levelWidth;
    gameStateRef.current.player = {
      x: 100,
      y: 100,
      width: 32,
      height: 32,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      facingRight: true,
      lives: 3,
      invincible: false,
    };
    gameStateRef.current.camera = { x: 0, y: 0 };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    initializeLevel();
  }, [initializeLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGameState((prev) => (prev === "playing" ? "paused" : prev === "paused" ? "playing" : prev));
      }
      if (gameState === "menu" && e.key === "Enter") {
        startGame();
      }
      gameStateRef.current.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = Math.min(window.innerWidth - 40, 1200);
        canvas.height = Math.min(window.innerHeight - 200, 600);
        gameStateRef.current.canvas.width = canvas.width;
        gameStateRef.current.canvas.height = canvas.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const gameLoop = () => {
      if (gameState !== "playing") {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const game = gameStateRef.current;
      const { player, platforms, coins, enemies, keys, touchControls, camera } = game;
      const { width: canvasWidth, height: canvasHeight } = game.canvas;

      // Clear canvas
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (let i = 0; i < 5; i++) {
        const cloudX = (i * 400 - camera.x * 0.5) % (canvasWidth + 200);
        ctx.beginPath();
        ctx.arc(cloudX, 80 + i * 30, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 80 + i * 30, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, 80 + i * 30, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player movement
      const moveSpeed = 5;
      const jumpPower = 12;
      const gravity = 0.5;

      if (keys["ArrowLeft"] || keys["a"] || keys["A"] || touchControls.left) {
        player.velocityX = -moveSpeed;
        player.facingRight = false;
      } else if (keys["ArrowRight"] || keys["d"] || keys["D"] || touchControls.right) {
        player.velocityX = moveSpeed;
        player.facingRight = true;
      } else {
        player.velocityX *= 0.8;
      }

      if ((keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "] || touchControls.jump) && !player.isJumping) {
        player.velocityY = -jumpPower;
        player.isJumping = true;
      }

      // Apply gravity
      player.velocityY += gravity;

      // Update player position
      player.x += player.velocityX;
      player.y += player.velocityY;

      // Camera follow player
      camera.x = player.x - canvasWidth / 3;
      camera.x = Math.max(0, Math.min(camera.x, game.levelWidth - canvasWidth));

      // Platform collision
      player.isJumping = true;
      platforms.forEach((platform) => {
        if (
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + platform.height + 10 &&
          player.velocityY > 0
        ) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.isJumping = false;
        }
      });

      // Collect coins
      coins.forEach((coin) => {
        if (
          !coin.collected &&
          player.x + player.width > coin.x &&
          player.x < coin.x + coin.width &&
          player.y + player.height > coin.y &&
          player.y < coin.y + coin.height
        ) {
          coin.collected = true;
          setScore((prev) => prev + 10);
        }
      });

      // Enemy collision and movement
      enemies.forEach((enemy) => {
        // Enemy movement
        enemy.x += enemy.velocityX * enemy.direction;

        // Enemy platform collision
        let onPlatform = false;
        platforms.forEach((platform) => {
          if (
            enemy.x + enemy.width > platform.x &&
            enemy.x < platform.x + platform.width &&
            enemy.y + enemy.height > platform.y &&
            enemy.y + enemy.height < platform.y + 15
          ) {
            enemy.y = platform.y - enemy.height;
            onPlatform = true;

            // Turn around at platform edges
            if (enemy.x < platform.x + 10 || enemy.x + enemy.width > platform.x + platform.width - 10) {
              enemy.direction *= -1;
            }
          }
        });

        if (!onPlatform) {
          enemy.velocityY += gravity;
          enemy.y += enemy.velocityY;
        } else {
          enemy.velocityY = 0;
        }

        // Player-enemy collision
        if (
          !player.invincible &&
          player.x + player.width > enemy.x &&
          player.x < enemy.x + enemy.width &&
          player.y + player.height > enemy.y &&
          player.y < enemy.y + enemy.height
        ) {
          // Check if jumping on enemy
          if (player.velocityY > 0 && player.y + player.height - 10 < enemy.y + enemy.height / 2) {
            enemy.y = -100; // Remove enemy
            player.velocityY = -8;
            setScore((prev) => prev + 20);
          } else {
            player.lives -= 1;
            player.invincible = true;
            setTimeout(() => {
              player.invincible = false;
            }, 2000);

            if (player.lives <= 0) {
              setGameState("gameover");
              if (score > highScore) {
                setHighScore(score);
                localStorage.setItem("marioHighScore", score.toString());
              }
            }
          }
        }
      });

      // Check if player fell off
      if (player.y > canvasHeight + 100) {
        player.lives -= 1;
        player.x = 100;
        player.y = 100;
        player.velocityX = 0;
        player.velocityY = 0;

        if (player.lives <= 0) {
          setGameState("gameover");
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("marioHighScore", score.toString());
          }
        }
      }

      // Check if player reached the end
      if (player.x > game.levelWidth - 400) {
        setGameState("won");
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem("marioHighScore", score.toString());
        }
      }

      // Draw platforms
      platforms.forEach((platform) => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(
          platform.x - camera.x,
          platform.y,
          platform.width,
          platform.height
        );

        // Platform outline
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          platform.x - camera.x,
          platform.y,
          platform.width,
          platform.height
        );
      });

      // Draw coins
      coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(
            coin.x - camera.x + coin.width / 2,
            coin.y + coin.height / 2,
            coin.width / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Coin shine
          ctx.fillStyle = "#FFF";
          ctx.beginPath();
          ctx.arc(
            coin.x - camera.x + coin.width / 2 - 4,
            coin.y + coin.height / 2 - 4,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Draw enemies
      enemies.forEach((enemy) => {
        if (enemy.y > -50) {
          ctx.fillStyle = "#E74C3C";
          ctx.fillRect(
            enemy.x - camera.x,
            enemy.y,
            enemy.width,
            enemy.height
          );

          // Enemy eyes
          ctx.fillStyle = "#FFF";
          ctx.fillRect(enemy.x - camera.x + 5, enemy.y + 8, 8, 8);
          ctx.fillRect(enemy.x - camera.x + 17, enemy.y + 8, 8, 8);
          ctx.fillStyle = "#000";
          ctx.fillRect(enemy.x - camera.x + 7, enemy.y + 10, 4, 4);
          ctx.fillRect(enemy.x - camera.x + 19, enemy.y + 10, 4, 4);
        }
      });

      // Draw player
      if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = "#E74C3C";
        // Body
        ctx.fillRect(player.x - camera.x, player.y + 8, player.width, player.height - 8);

        // Hat
        ctx.fillStyle = "#C0392B";
        ctx.fillRect(player.x - camera.x, player.y, player.width, 8);

        // Face
        ctx.fillStyle = "#F4A460";
        ctx.fillRect(player.x - camera.x + 8, player.y + 8, 16, 10);

        // Mustache
        ctx.fillStyle = "#654321";
        ctx.fillRect(player.x - camera.x + 8, player.y + 14, 16, 4);

        // Eyes
        ctx.fillStyle = "#000";
        ctx.fillRect(player.x - camera.x + 10, player.y + 10, 3, 3);
        ctx.fillRect(player.x - camera.x + 19, player.y + 10, 3, 3);

        // Buttons
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(player.x - camera.x + 14, player.y + 20, 4, 4);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState, highScore, score]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Header */}
      <div className="w-full max-w-6xl mb-4 flex justify-between items-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg animate-float">
          🍄 Marionetta
        </h1>
        <div className="text-right">
          <div className="text-lg md:text-2xl font-bold text-yellow-400 drop-shadow-lg">
            Score: {score}
          </div>
          <div className="text-sm md:text-lg text-gray-300">
            High: {highScore}
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative bg-gradient-to-b from-blue-900 to-blue-700 rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-500">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {/* Lives Display */}
        {gameState === "playing" && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
            <div className="flex gap-2 items-center">
              <span className="text-white font-bold">Lives:</span>
              {Array.from({ length: gameStateRef.current.player.lives }).map((_, i) => (
                <span key={i} className="text-2xl">❤️</span>
              ))}
            </div>
          </div>
        )}

        {/* Menu Overlay */}
        {gameState === "menu" && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 bg-opacity-95 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-6 animate-float">
              <h2 className="text-5xl md:text-7xl font-bold text-yellow-400 drop-shadow-2xl mb-4">
                🎮 MARIONETTA
              </h2>
              <p className="text-xl md:text-2xl text-white mb-8 max-w-md px-4">
                Jump, collect coins, and avoid enemies in this exciting adventure!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 md:py-6 md:px-12 rounded-full text-xl md:text-3xl shadow-2xl transform transition hover:scale-110 active:scale-95 animate-pulse-custom"
              >
                START GAME
              </button>
              <div className="mt-8 text-white text-sm md:text-lg space-y-2">
                <p className="font-bold text-yellow-300">Controls:</p>
                <p>← → or A D - Move</p>
                <p>↑ or W or SPACE - Jump</p>
                <p>ESC - Pause</p>
              </div>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-8 animate-pulse-custom">
              PAUSED
            </h2>
            <button
              onClick={() => setGameState("playing")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-2xl transform transition hover:scale-110"
            >
              RESUME
            </button>
            <button
              onClick={() => setGameState("menu")}
              className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-full text-xl shadow-2xl transform transition hover:scale-110"
            >
              MAIN MENU
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-black bg-opacity-95 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-5xl md:text-7xl font-bold text-red-500 mb-4 animate-pulse-custom">
              GAME OVER
            </h2>
            <p className="text-3xl text-white mb-2">Final Score: {score}</p>
            <p className="text-xl text-yellow-400 mb-8">High Score: {highScore}</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-2xl transform transition hover:scale-110"
            >
              TRY AGAIN
            </button>
            <button
              onClick={() => setGameState("menu")}
              className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-full text-xl shadow-2xl transform transition hover:scale-110"
            >
              MAIN MENU
            </button>
          </div>
        )}

        {/* Won Overlay */}
        {gameState === "won" && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-500 bg-opacity-95 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-float drop-shadow-2xl">
              🎉 YOU WON! 🎉
            </h2>
            <p className="text-3xl text-white mb-2">Final Score: {score}</p>
            <p className="text-xl text-yellow-200 mb-8">High Score: {highScore}</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-full text-2xl shadow-2xl transform transition hover:scale-110"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => setGameState("menu")}
              className="mt-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-3 px-6 rounded-full text-xl shadow-2xl transform transition hover:scale-110"
            >
              MAIN MENU
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      {isMobile && gameState === "playing" && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-between px-8 pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
            <button
              onTouchStart={() => (gameStateRef.current.touchControls.left = true)}
              onTouchEnd={() => (gameStateRef.current.touchControls.left = false)}
              className="w-16 h-16 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center text-3xl shadow-2xl active:bg-blue-600 border-2 border-white"
            >
              ←
            </button>
            <button
              onTouchStart={() => (gameStateRef.current.touchControls.right = true)}
              onTouchEnd={() => (gameStateRef.current.touchControls.right = false)}
              className="w-16 h-16 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center text-3xl shadow-2xl active:bg-blue-600 border-2 border-white"
            >
              →
            </button>
          </div>
          <button
            onTouchStart={() => (gameStateRef.current.touchControls.jump = true)}
            onTouchEnd={() => (gameStateRef.current.touchControls.jump = false)}
            className="w-20 h-20 bg-red-500 bg-opacity-80 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl active:bg-red-600 border-2 border-white pointer-events-auto"
          >
            JUMP
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center text-white text-sm md:text-base opacity-75 max-w-2xl">
        <p>Reach the golden platform at the end to win! Collect coins and stomp on enemies for points.</p>
      </div>
    </div>
  );
}
