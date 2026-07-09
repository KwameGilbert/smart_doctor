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
    }, 6000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const renderPattern = () => {
    switch (patternIndex) {
      case 0:
        // Pattern 1: Tech Arcs & Concentric Circles (Originating from unseen corner cx=280, cy=0)
        return (
          <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            <Circle cx="280" cy="0" r="250" fill="#1565C0" fillOpacity="0.08" />
            <Circle cx="280" cy="0" r="210" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" />
            <Circle cx="280" cy="0" r="170" fill="#1565C0" fillOpacity="0.06" />
            <Circle cx="280" cy="0" r="130" stroke="#1565C0" strokeOpacity="0.22" strokeWidth="1.2" />
            <Circle cx="280" cy="0" r="90" fill="#1565C0" fillOpacity="0.05" />
            <Circle cx="280" cy="0" r="50" stroke="#1565C0" strokeOpacity="0.18" strokeWidth="1.2" />
            <Path
              d="M 280,150 A 150,150 0 0,1 130,0"
              stroke="#1565C0"
              strokeOpacity="0.32"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <Path
              d="M 280,190 A 190,190 0 0,1 90,0"
              stroke="#1565C0"
              strokeOpacity="0.3"
              strokeWidth="1.2"
            />
            <Path
              d="M 280,230 A 230,230 0 0,1 50,0"
              stroke="#1565C0"
              strokeOpacity="0.25"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </Svg>
        );

      case 1:
        // Pattern 2: Honeycomb / Hexagonal Grid (Scaled up & fanned out)
        return (
          <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            {/* Hexagon 1: Center (240, 40) */}
            <Path
              d="M 240,12 L 264,26 L 264,54 L 240,68 L 216,54 L 216,26 Z"
              stroke="#1565C0" strokeOpacity="0.32" strokeWidth="1.2" fill="#1565C0" fillOpacity="0.06"
            />
            {/* Hexagon 2: Center (192, 40) */}
            <Path
              d="M 192,12 L 216,26 L 216,54 L 192,68 L 168,54 L 168,26 Z"
              stroke="#1565C0" strokeOpacity="0.28" strokeWidth="1.2"
            />
            {/* Hexagon 3: Center (264, 82) */}
            <Path
              d="M 264,54 L 288,68 L 288,96 L 264,110 L 240,96 L 240,68 Z"
              stroke="#1565C0" strokeOpacity="0.28" strokeWidth="1.2"
            />
            {/* Hexagon 4: Center (216, 82) */}
            <Path
              d="M 216,54 L 240,68 L 240,96 L 216,110 L 192,96 L 192,68 Z"
              stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2" fill="#1565C0" fillOpacity="0.08"
            />
            {/* Hexagon 5: Center (168, 82) */}
            <Path
              d="M 168,54 L 192,68 L 192,96 L 168,110 L 144,96 L 144,68 Z"
              stroke="#1565C0" strokeOpacity="0.22" strokeWidth="1.2"
            />
            {/* Hexagon 6: Center (240, 124) */}
            <Path
              d="M 240,96 L 264,110 L 264,138 L 240,152 L 216,138 L 216,110 Z"
              stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.2"
            />
            {/* Hexagon 7: Center (192, 124) */}
            <Path
              d="M 192,96 L 216,110 L 216,138 L 192,152 L 168,138 L 168,110 Z"
              stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2"
            />
            {/* Hexagon 8: Center (144, 124) */}
            <Path
              d="M 144,96 L 168,110 L 168,138 L 144,152 L 120,138 L 120,110 Z"
              stroke="#1565C0" strokeOpacity="0.18" strokeWidth="1"
            />
          </Svg>
        );

      case 2:
        // Pattern 3: DNA Helix / Wave Curves (Wide sweep)
        return (
          <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            {/* Wave 1 */}
            <Path
              d="M 40,60 C 100,20 160,140 220,100 C 240,80 260,40 280,60"
              stroke="#1565C0" strokeOpacity="0.32" strokeWidth="1.8"
            />
            {/* Wave 2 */}
            <Path
              d="M 40,100 C 100,140 160,20 220,60 C 240,80 260,120 280,100"
              stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.8" strokeDasharray="3 3"
            />
            {/* Connections */}
            <Path d="M 76,64 L 80,96" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
            <Path d="M 112,60 L 115,100" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
            <Path d="M 148,82 L 150,78" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
            <Path d="M 184,104 L 181,68" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
            <Path d="M 220,100 L 217,60" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
            <Path d="M 256,76 L 253,92" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.2" />
          </Svg>
        );

      case 3:
        // Pattern 4: Medical Crosses / Plus Stars (Fanned out)
        return (
          <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            {/* Cross 1 */}
            <Path d="M 244,40 L 256,40 M 250,34 L 250,46" stroke="#1565C0" strokeOpacity="0.4" strokeWidth="2.2" />
            {/* Cross 2 */}
            <Path d="M 196,70 L 204,70 M 200,66 L 200,74" stroke="#1565C0" strokeOpacity="0.3" strokeWidth="1.8" />
            {/* Cross 3 */}
            <Path d="M 251,110 L 259,110 M 255,106 L 255,114" stroke="#1565C0" strokeOpacity="0.32" strokeWidth="1.8" />
            {/* Cross 4 */}
            <Path d="M 201,150 L 209,150 M 205,146 L 205,154" stroke="#1565C0" strokeOpacity="0.25" strokeWidth="1.8" />
            {/* Cross 5 */}
            <Path d="M 137,130 L 143,130 M 140,127 L 140,133" stroke="#1565C0" strokeOpacity="0.2" strokeWidth="1.5" />
            {/* Cross 6 */}
            <Path d="M 236,190 L 244,190 M 240,186 L 240,194" stroke="#1565C0" strokeOpacity="0.22" strokeWidth="1.5" />
            {/* Cross 7 */}
            <Path d="M 176,210 L 184,210 M 180,206 L 180,214" stroke="#1565C0" strokeOpacity="0.18" strokeWidth="1.5" />
            {/* Cross 8 */}
            <Path d="M 116,190 L 124,190 M 120,186 L 120,194" stroke="#1565C0" strokeOpacity="0.15" strokeWidth="1.2" />
          </Svg>
        );

      case 4:
      default:
        // Pattern 5: Digital Dotted Wave Grid (Large fan)
        return (
          <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
            <Circle cx="260" cy="20" r="3" fill="#1565C0" fillOpacity="0.4" />
            <Circle cx="230" cy="20" r="2.5" fill="#1565C0" fillOpacity="0.32" />
            <Circle cx="200" cy="20" r="2" fill="#1565C0" fillOpacity="0.28" />
            <Circle cx="170" cy="20" r="1.5" fill="#1565C0" fillOpacity="0.2" />
            <Circle cx="140" cy="20" r="1" fill="#1565C0" fillOpacity="0.15" />

            <Circle cx="260" cy="50" r="2.5" fill="#1565C0" fillOpacity="0.32" />
            <Circle cx="230" cy="50" r="3" fill="#1565C0" fillOpacity="0.35" />
            <Circle cx="200" cy="50" r="2.5" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="170" cy="50" r="2" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="140" cy="50" r="1.5" fill="#1565C0" fillOpacity="0.15" />
            <Circle cx="110" cy="50" r="1" fill="#1565C0" fillOpacity="0.1" />

            <Circle cx="260" cy="80" r="2" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="230" cy="80" r="2.5" fill="#1565C0" fillOpacity="0.28" />
            <Circle cx="200" cy="80" r="3" fill="#1565C0" fillOpacity="0.3" />
            <Circle cx="170" cy="80" r="2.5" fill="#1565C0" fillOpacity="0.2" />
            <Circle cx="140" cy="80" r="2" fill="#1565C0" fillOpacity="0.15" />
            <Circle cx="110" cy="80" r="1.5" fill="#1565C0" fillOpacity="0.12" />
            <Circle cx="80" cy="80" r="1" fill="#1565C0" fillOpacity="0.08" />

            <Circle cx="230" cy="110" r="2" fill="#1565C0" fillOpacity="0.2" />
            <Circle cx="200" cy="110" r="2.5" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="170" cy="110" r="3" fill="#1565C0" fillOpacity="0.25" />
            <Circle cx="140" cy="110" r="2.5" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="110" cy="110" r="2" fill="#1565C0" fillOpacity="0.12" />
            <Circle cx="80" cy="110" r="1.5" fill="#1565C0" fillOpacity="0.08" />

            <Circle cx="200" cy="140" r="2" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="170" cy="140" r="2.5" fill="#1565C0" fillOpacity="0.18" />
            <Circle cx="140" cy="140" r="3" fill="#1565C0" fillOpacity="0.22" />
            <Circle cx="110" cy="140" r="2.5" fill="#1565C0" fillOpacity="0.15" />
            <Circle cx="80" cy="140" r="2" fill="#1565C0" fillOpacity="0.1" />

            <Circle cx="170" cy="170" r="1.5" fill="#1565C0" fillOpacity="0.12" />
            <Circle cx="140" cy="170" r="2" fill="#1565C0" fillOpacity="0.12" />
            <Circle cx="110" cy="170" r="2.5" fill="#1565C0" fillOpacity="0.15" />
            <Circle cx="80" cy="170" r="2" fill="#1565C0" fillOpacity="0.1" />
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
    top: -50,
    right: -50,
    width: 280,
    height: 280,
    zIndex: -1,
  },
});
