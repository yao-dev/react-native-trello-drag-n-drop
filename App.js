import Constants from "expo-constants";
import React, { useState } from "react";
import { Animated, FlatList, PanResponder, Platform, SafeAreaView, StyleSheet, Text, UIManager } from "react-native";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const getRandomColor = () => {
  const min = 50;
  const max = 255;
  const r = Math.floor(Math.random() * (max - min) + min);
  const g = Math.floor(Math.random() * (max - min) + min);
  const b = Math.floor(Math.random() * (max - min) + min);

  return `rgba(${r},${g},${b},1)`;
};

const alphabet = 'abcdefghijklmnopqrstuvxyz'.toUpperCase().split('');

const colorMap = {};
const defaultList = alphabet.map((value, i) => {
  colorMap[value] = getRandomColor();
  return value;
});
const marginVerticalPerITem = 0; // 5
const marginHorizontalPerITem = 0; // 10

export default function App() {
  const valueXY = new Animated.ValueXY();
  const [state, setState] = useState({
    defaultList,
    list: defaultList,
    dragging: false,
    itemBelowDragging: null,
    currentItem: null,
    itemLayout: {},
  })
  const updateState = (newState) => setState({ ...state, ...newState })

  const Pan = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderGrant: (evt, gestureState) => {
      const touchY = gestureState.y0 - Constants.statusBarHeight;
      const currentItem = getItemIndexBelowTouch(touchY);
      valueXY.setValue({ y: gestureState.y0 - Constants.statusBarHeight })

      updateState({
        itemBelowDragging: currentItem,
        currentItem: currentItem,
        dragging: true,
      })
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!state.dragging) return;

      valueXY.setValue({
        y: gestureState.moveY - Constants.statusBarHeight - this.listItemHeight / 2,
        x: gestureState.dx,
      })

      const nextIndex = getItemIndexBelowTouch(gestureState.moveY);

      if (nextIndex !== state.itemBelowDragging) {
        return updateState({
          itemBelowDragging: nextIndex,
          list: inverseItem(state.itemBelowDragging, nextIndex)
        })
        // if (nextIndex < state.currentItem && gestureState.moveY < (nextIndex + 1) * this.listItemHeight - (this.listItemHeight / 2)) {
        //   updateState({
        //     itemBelowDragging: nextIndex,
        //     list: inverseItem(state.currentItem, nextIndex)
        //   })
        // }
        // if (nextIndex > state.currentItem && gestureState.moveY > (nextIndex + 1) * this.listItemHeight - (this.listItemHeight / 2)) {
        //   updateState({
        //     itemBelowDragging: nextIndex,
        //     list: inverseItem(state.currentItem, nextIndex)
        //   })
        // }
      }
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      updateState({
        dragging: false,
        itemBelowDragging: null,
        currentItem: null,
        defaultList: state.list
      })
    },
    onPanResponderTerminate: (evt, gestureState) => {
      updateState({
        dragging: false,
        itemBelowDragging: null,
        currentItem: null,
        defaultList: state.list
      })
    },
    onShouldBlockNativeResponder: (evt, gestureState) => true
  });

  const getItemIndexBelowTouch = (touchY) => {
    return Math.floor(touchY / (this.listItemHeight))
  }

  const getItemByIndex = (index, list = state.defaultList) => ({
    item: list[index],
    index
  });

  inverseItem = (firstItem, secondItem) => {
    const reorderList = [...state.list];
    const a = reorderList[secondItem];
    const b = reorderList[firstItem];

    reorderList.splice(firstItem, 1, a);
    reorderList.splice(secondItem, 1, b);

    return reorderList;
  }

  const renderItem = ({ item, index }, data = {}) => {
    const renderItemStyle = data.styles ? ({
      ...styles.listItem,
      ...data.styles,
    }) : styles.listItem;

    return (
      <Animated.View
        {...Pan.panHandlers}
        onLayout={e => {
          this.listItemHeight = e.nativeEvent.layout.height + marginVerticalPerITem;
          this.listItemWidth = e.nativeEvent.layout.width + marginHorizontalPerITem;
        }}
        style={{
          ...renderItemStyle,
          backgroundColor: colorMap[item],
          opacity: !data.dragging && state.itemBelowDragging === index ? 0 : 1,
        }}
      >
        <Text style={styles.itemText}>{item}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        // onLayout={e => {
        //   console.log(e.nativeEvent.layout)
        // }}
        data={state.list}
        extraData={state.list}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={{ width: "100%" }}
      />
      {state.dragging &&
        renderItem(getItemByIndex(state.currentItem, state.defaultList), {
          dragging: state.dragging,
          styles: {
            position: "absolute",
            width: this.listItemWidth,
            transform: [{ rotate: '1deg' }],
            ...valueXY.getLayout()
          }
        }
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight
  },
  listItem: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: marginVerticalPerITem / 2,
    marginHorizontal: marginHorizontalPerITem / 2,
    // borderRadius: 5
  },
  itemText: {
    fontWeight: "bold"
  }
});
