import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

const AnimationStudio = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  const availableModels = [
    '64f1a714fe61576b46f27ca2_3.glb',
    '64f1a714fe61576b46f27ca2_4.glb', 
    '64f1a714fe61576b46f27ca2_5.glb',
    '64f1a714fe61576b46f27ca2_6.glb',
    '64f1a714fe61576b46f27ca2.glb',
    '64f1a714fe61576b46f27ca222.glb',
  ];

  const availableAnimations = [
    'Angry.fbx',
    'Crying.fbx',
    'Laughing.fbx',
    'Rumba Dancing.fbx',
    'Standing Idle.fbx',
    'Talking_0.fbx',
    'Talking_00.fbx', 
    'Talking_1.fbx',
    'Talking_2.fbx',
    'Terrified.fbx',
    'Thinking_0.fbx',
    'Thinking.fbx'
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Animation Studio</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Select Avatar Model</h3>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a model...</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>
                    {model.replace('.glb', '').replace('64f1a714fe61576b46f27ca2', 'Avatar')}
                  </option>
                ))}
              </select>
            </div>

            {/* Animation Selection */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Select Animation</h3>
              <select 
                value={selectedAnimation} 
                onChange={(e) => setSelectedAnimation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedModel}
              >
                <option value="">Choose animation...</option>
                {availableAnimations.map(animation => (
                  <option key={animation} value={animation}>
                    {animation.replace('.fbx', '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              
              {selectedModel && !selectedModel.includes('64f1a714fe61576b46f27ca2.glb') && (
                <p className="mt-2 text-sm text-orange-600">
                  ⚠️ This model may not be fully compatible with all animations. 
                  For best results, use "Avatar" model.
                </p>
              )}
              
              {!selectedModel && (
                <p className="mt-2 text-sm text-gray-500">
                  Please select a model first
                </p>
              )}
            </div>

            {/* Animation Controls */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Animation Controls</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!selectedModel || !selectedAnimation}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPlaying ? 'Pause' : 'Play'} Animation
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {animationSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Export Options</h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Export as GLB
                </button>
                <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* 3D Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
              <div className="h-full">
                <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  
                  {selectedModel && (
                    <AvatarModel 
                      modelPath={`/models/${selectedModel}`}
                      animationPath={selectedAnimation ? `/animations/${selectedAnimation}` : null}
                      isPlaying={isPlaying}
                      speed={animationSpeed}
                    />
                  )}
                  
                  {!selectedModel && (
                    <Html center>
                      <div className="text-gray-500 text-center">
                        <p>Select a model to begin</p>
                      </div>
                    </Html>
                  )}
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AvatarModel = ({ modelPath, animationPath, isPlaying, speed }) => {
  const group = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();
  const fbxActionRef = useRef();
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [animationsGltf, setAnimationsGltf] = useState(null);

  // Load avatar model
  const { nodes, materials } = useLoader(GLTFLoader, modelPath);
  
  // Load animation library separately with error handling
  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/animations.glb",
      (gltf) => {
        setAnimationsGltf(gltf);
      },
      undefined,
      (error) => {
        console.warn("Could not load default animations:", error);
        setAnimationsGltf(null);
      }
    );
  }, []);
  
  // Setup animation mixer when model loads
  useEffect(() => {
    if (group.current) {
      // Setup animation mixer directly on the group (like Avatar.jsx)
      mixerRef.current = new THREE.AnimationMixer(group.current);
      console.log(`Animation mixer created for model: ${modelPath}`);
      
      // Debug: Log available bones/nodes
      if (nodes) {
        console.log(`Available nodes for ${modelPath}:`, Object.keys(nodes));
        if (nodes.Hips) {
          console.log('Hips node found - model should support animations');
        } else {
          console.warn('No Hips node found - animations may not work');
        }
      }
    }
  }, [modelPath, nodes]);

  // Setup default idle animation when both scene and animations are loaded
  useEffect(() => {
    if (mixerRef.current && animationsGltf && animationsGltf.animations) {
      const idleAnimation = animationsGltf.animations.find(anim => 
        anim.name.toLowerCase().includes('idle') || 
        anim.name.toLowerCase().includes('standing')
      );
      
      if (idleAnimation) {
        actionRef.current = mixerRef.current.clipAction(idleAnimation);
        actionRef.current.play();
        setCurrentAnimation('idle');
      }
    }
  }, [animationsGltf]);

  // Handle FBX animation loading
  useEffect(() => {
    if (animationPath && mixerRef.current) {
      const fbxLoader = new FBXLoader();
      
      fbxLoader.load(
        animationPath,
        (fbx) => {
          if (fbx.animations && fbx.animations.length > 0) {
            // Stop current animation
            if (actionRef.current) {
              actionRef.current.stop();
            }
            if (fbxActionRef.current) {
              fbxActionRef.current.stop();
            }
            
            try {
              // Create new action from FBX animation
              fbxActionRef.current = mixerRef.current.clipAction(fbx.animations[0]);
              
              // Configure animation
              fbxActionRef.current.setLoop(THREE.LoopRepeat);
              fbxActionRef.current.clampWhenFinished = false;
              fbxActionRef.current.timeScale = speed;
              
              if (isPlaying) {
                fbxActionRef.current.reset().play();
              }
              
              setCurrentAnimation('fbx');
              console.log(`Animation "${animationPath}" loaded successfully for model "${modelPath}"`);
            } catch (error) {
              console.warn(`Animation "${animationPath}" not compatible with model "${modelPath}":`, error);
              // Fallback to idle animation
              if (actionRef.current) {
                actionRef.current.play();
                setCurrentAnimation('idle');
              }
            }
          }
        },
        (progress) => {
          console.log('Animation loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (error) => {
          console.error('Error loading FBX animation:', error);
          // Fallback to idle animation
          if (actionRef.current) {
            actionRef.current.play();
            setCurrentAnimation('idle');
          }
        }
      );
    } else if (!animationPath && actionRef.current) {
      // No FBX animation selected, use default idle
      if (fbxActionRef.current) {
        fbxActionRef.current.stop();
      }
      if (actionRef.current) {
        actionRef.current.play();
        setCurrentAnimation('idle');
      }
    }
  }, [animationPath, speed, modelPath]);

  // Handle play/pause and speed changes
  useEffect(() => {
    const activeAction = currentAnimation === 'fbx' ? fbxActionRef.current : actionRef.current;
    
    if (activeAction) {
      activeAction.timeScale = speed;
      
      if (isPlaying) {
        if (!activeAction.isRunning()) {
          activeAction.reset().play();
        }
      } else {
        activeAction.paused = true;
      }
    }
  }, [isPlaying, speed, currentAnimation]);

  // Animation frame update
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);

  if (!nodes || !materials) {
    return (
      <Html center>
        <div className="text-white bg-black bg-opacity-50 p-2 rounded">
          Loading model...
        </div>
      </Html>
    );
  }

  return (
    <group ref={group} dispose={null} position={[0, -1, 0]} scale={1}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
};

export default AnimationStudio;