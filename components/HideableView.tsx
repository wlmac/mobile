import React from 'react';

import { View } from './Themed';

// This will be used to toggle between a weekly and monthly calendar page 
export default function HideableView({ visible, children, style } : { visible: boolean, children: React.ReactNode, style: any }) {
  return (
    // If visible is true, render style and children
    <View style={visible ? style : null}>
      {visible && children}
    </View>
  );
} 
