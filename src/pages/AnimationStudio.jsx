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
    'avatar1.glb',
    'avatar2.glb', 
    'avatar3.glb',
    'avatar4.glb',
    'avatar5.glb',
    'avatar.glb',
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
                    {model.replace('.glb', '').replace('avatar', 'Avatar')}
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
              >
                <option value="">Choose animation...</option>
                {availableAnimations.map(animation => (
                  <option key={animation} value={animation}>
                    {animation.replace('.fbx', '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
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
        
        // Check skeleton compatibility
        const hasHips = nodes.Hips || nodes.hips;
        const hasSpine = nodes.Spine || nodes.spine || nodes.Spine1;
        const hasLeftArm = nodes.LeftArm || nodes.leftArm || nodes['Left_Arm'];
        const hasRightArm = nodes.RightArm || nodes.rightArm || nodes['Right_Arm'];
        
        console.log('Skeleton check:', {
          hasHips: !!hasHips,
          hasSpine: !!hasSpine,
          hasLeftArm: !!hasLeftArm,
          hasRightArm: !!hasRightArm
        });
        
        if (hasHips && hasSpine) {
          console.log('✅ Model has good skeleton structure for animations');
        } else {
          console.warn('⚠️ Model may have limited animation support');
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
              // Clone the animation to avoid affecting the original
              const animationClone = fbx.animations[0].clone();
              
              // Try to map animation tracks to available bones
              const filteredTracks = [];
              
              animationClone.tracks.forEach(track => {
                // Extract bone name from track name
                const trackParts = track.name.split('.');
                let boneName = trackParts[0]; // Start with first part
                
                // Handle different track naming patterns:
                // "Hips.position" -> "Hips"
                // "Armature.Hips.position" -> "Hips" 
                // "mixamo_rig.Hips.position" -> "Hips"
                if (trackParts.length > 1) {
                  if (trackParts[0] === 'Armature' || trackParts[0] === 'mixamo_rig' || trackParts[0].includes('rig')) {
                    boneName = trackParts[1]; // Use second part as bone name
                  } else {
                    boneName = trackParts[0]; // Use first part as bone name
                  }
                }
                
                // Skip tracks for end effectors and constraints that don't exist in model
                const skipPatterns = [
                  '_end', '_End', 'IK', 'Constraint', 'Armature001', 'mixamo_rig',
                  'HeadTop_End', 'LeftEye_end', 'RightEye_end', 'LeftToe_End', 'RightToe_End',
                  'LeftHandThumb4_end', 'LeftHandIndex4_end', 'LeftHandMiddle4_end', 
                  'LeftHandRing4_end', 'LeftHandPinky4_end',
                  'RightHandThumb4_end', 'RightHandIndex4_end', 'RightHandMiddle4_end', 
                  'RightHandRing4_end', 'RightHandPinky4_end'
                ];
                
                const shouldSkip = skipPatterns.some(pattern => 
                  boneName.includes(pattern) || track.name.includes(pattern)
                );
                
                if (shouldSkip) {
                  console.log(`Skipping end effector/constraint track: ${track.name}`);
                  return;
                }
                
                // Check if this bone exists in the model nodes
                const boneExists = nodes[boneName] || 
                                  nodes[boneName.toLowerCase()] || 
                                  nodes[boneName.charAt(0).toUpperCase() + boneName.slice(1)];
                
                if (boneExists) {
                  filteredTracks.push(track);
                  console.log(`✅ Keeping track: ${track.name} (bone: ${boneName})`);
                } else {
                  console.log(`❌ Skipping track for missing bone: ${track.name} (bone: ${boneName})`);
                }
              });
              
              // Create animation clip with filtered tracks
              if (filteredTracks.length > 0) {
                const compatibleAnimation = new THREE.AnimationClip(
                  animationClone.name + '_compatible',
                  animationClone.duration,
                  filteredTracks
                );
                
                // Create action with compatible animation
                fbxActionRef.current = mixerRef.current.clipAction(compatibleAnimation);
                
                // Configure animation
                fbxActionRef.current.setLoop(THREE.LoopRepeat);
                fbxActionRef.current.clampWhenFinished = false;
                fbxActionRef.current.timeScale = speed;
                
                if (isPlaying) {
                  fbxActionRef.current.reset().play();
                }
                
                setCurrentAnimation('fbx');
                console.log(`Animation "${animationPath}" loaded with ${filteredTracks.length} compatible tracks for model "${modelPath}"`);
              } else {
                throw new Error('No compatible animation tracks found');
              }
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