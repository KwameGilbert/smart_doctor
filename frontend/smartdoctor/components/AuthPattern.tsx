import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function AuthPattern() {
  const [patternIndex, setPatternIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: Fade out current pattern
      Animated.timing(fadeAnim, {
        toValue: 0.1,
        duration: 900,
        useNativeDriver: true,
      }).start(() => {
        // Step 2: Swap to next pattern index
        setPatternIndex((prev) => (prev + 1) % 5);
        
        // Step 3: Fade in new pattern
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const renderPattern = () => {
    switch (patternIndex) {
      case 0:
        // Pattern 1: Tech Arcs & Concentric Circles (Deepened Opacity)
        return (
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <Circle cx="140" cy="0" r="110" fill="#1565C0" fillOpacity="0.1" />
            <Circle cx="140" cy="0" r="85" stroke="#1565C0" strokeOpacity="0.3" strokeWidth="1.2" />
            <Circle cx="140" cy="0" r="60" fill="#1565C0" fillOpacity="0.08" />
            <Circle cx="140" cy="0" r="35" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Path
              d="M 140,60 A 60,60 0 0,1 80,0"
              stroke="#1565C0"
              strokeOpacity="0.38"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <Path
              d="M 140,85 A 85,85 0 0,1 55,0"
              stroke="#1565C0"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
          </Svg>
        );

      case 1:
        // Pattern 2: Honeycomb / Hexagonal Grid (Deepened Opacity)
        return (
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            {/* Hexagon 1 */}
            <Path
              d="M 120,4 L 134,12 L 134,28 L 120,36 L 106,28 L 106,12 Z"
              stroke="#1565C0" strokeOpacity="0.35" strokeWidth="1.2" fill="#1565C0" fillOpacity="0.08"
            />
            {/* Hexagon 2 */}
            <Path
              d="M 92,4 L 106,12 L 106,28 L 92,36 L 78,28 L 78,12 Z"
              stroke="#1565C0" strokeOpacity="0.3" strokeWidth="1.2"
            />
            {/* Hexagon 3 */}
            <Path
              d="M 134,28 L 148,36 L 148,52 L 134,60 L 120,52 L 120,36 Z"
              stroke="#1565C0" strokeOpacity="0.3" strokeWidth="1.2"
            />
            {/* Hexagon 4 */}
            <Path
              d="M 106,28 L 120,36 L 120,52 L 106,60 L 92,52 L 92,36 Z"
              stroke="#1565C0" strokeOpacity="0.28" strokeWidth="1.2" fill="#1565C0" fillOpacity="0.12"
            />
            {/* Hexagon 5 */}
            <Path
              d="M 78,28 L 92,36 L 92,52 L 78,60 L 64,52 L 64,36 Z"
              stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2"
            />
            {/* Hexagon 6 */}
            <Path
              d="M 120,52 L 134,60 L 134,76 L 120,84 L 106,76 L 106,60 Z"
              stroke="#1565C0" strokeOpacity="0.28" strokeWidth="1.2"
            />
          </Svg>
        );

      case 2:
        // Pattern 3: DNA Helix / Wave Curves (Deepened Opacity)
        return (
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            {/* Wave 1 */}
            <Path
              d="M 20,20 C 50,0 80,60 110,40 C 120,30 130,10 140,20"
              stroke="#1565C0" strokeOpacity="0.38" strokeWidth="1.8"
            />
            {/* Wave 2 */}
            <Path
              d="M 20,40 C 50,60 80,0 110,20 C 120,30 130,50 140,40"
              stroke="#1565C0" strokeOpacity="0.3" strokeWidth="1.8" strokeDasharray="3 3"
            />
            {/* Connections */}
            <Path d="M 38,20 L 40,40" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Path d="M 60,18 L 62,38" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Path d="M 82,24 L 84,32" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Path d="M 104,36 L 102,18" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Path d="M 124,32 L 122,12" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
          </Svg>
        );

      case 3:
        // Pattern 4: Medical Crosses / Plus Stars (Deepened Opacity)
        return (
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            {/* Cross 1: (110, 20) */}
            <Path d="M 104,20 L 116,20 M 110,14 L 110,26" stroke="#1565C0" strokeOpacity="0.45" strokeWidth="2.2" />
            {/* Cross 2: (80, 40) */}
            <Path d="M 76,40 L 84,40 M 80,36 L 80,44" stroke="#1565C0" strokeOpacity="0.32" strokeWidth="1.8" />
            {/* Cross 3: (125, 60) */}
            <Path d="M 121,60 L 129,60 M 125,56 L 125,64" stroke="#1565C0" strokeOpacity="0.35" strokeWidth="1.8" />
            {/* Cross 4: (95, 80) */}
            <Path d="M 91,80 L 99,80 M 95,76 L 95,84" stroke="#1565C0" strokeOpacity="0.28" strokeWidth="1.8" />
            {/* Cross 5: (60, 70) */}
            <Path d="M 57,70 L 63,70 M 60,67 L 60,73" stroke="#1565C0" strokeOpacity="0.22" strokeWidth="1.5" />
            {/* Cross 6: (120, 110) */}
            <Path d="M 116,110 L 124,110 M 120,106 L 120,114" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.5" />
          </Svg>
        );

      case 4:
      default:
        // Pattern 5: Digital Dotted Wave Grid (Deepened Opacity)
        return (
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <Circle cx="130" cy="10" r="2.5" fill="#1565C0" fillOpacity="0.45" />
            <Circle cx="110" cy="10" r="2" fill="#1565C0" fillOpacity="0.38" />
            <Circle cx="90" cy="10" r="1.5" fill="#1565C0" fillOpacity="0.32" />
            <Circle cx="70" cy="10" r="1" fill="#1565C0" fillOpacity="0.25" />

            <Circle cx="130" cy="30" r="2" fill="#1565C0" fillOpacity="0.32" />
            <Circle cx="110" cy="30" r="2.5" fill="#1565C0" fillOpacity="0.38" />
            <Circle cx="90" cy="30" r="2" fill="#1565C0" fillOpacity="0.28" />
            <Circle cx="70" cy="30" r="1.5" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="50" cy="30" r="1" fill="#1565C0" fillOpacity="0.16" />

            <Circle cx="130" cy="50" r="1.5" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="110" cy="50" r="2" fill="#1565C0" fillOpacity="0.28" />
            <Circle cx="90" cy="50" r="2.5" fill="#1565C0" fillOpacity="0.32" />
            <Circle cx="70" cy="50" r="2" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="50" cy="50" r="1.5" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="30" cy="50" r="1" fill="#1565C0" fillOpacity="0.12" />

            <Circle cx="130" cy="70" r="1" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="110" cy="70" r="1.5" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="90" cy="70" r="2" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="70" cy="70" r="2.5" fill="#1565C0" fillOpacity="0.28" />
            <Circle cx="50" cy="70" r="2" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="30" cy="70" r="1.5" fill="#1565C0" fillOpacity="0.12" />

            <Circle cx="110" cy="90" r="1" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="90" cy="90" r="1.5" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="70" cy="90" r="2" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="50" cy="90" r="2.5" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="30" cy="90" r="2" fill="#1565C0" fillOpacity="0.12" />
          </Svg>
        );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents="none">
      {renderPattern()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 140,
    height: 140,
    zIndex: -1,
  },
});
