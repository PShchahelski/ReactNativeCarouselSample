import {StatusBar} from 'expo-status-bar';
import React, {useRef, useState} from 'react';
import {Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

const DATA = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        number: '200000',
        title: 'Mindful minutes',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aww7f63',
        number: '0',
        title: 'Current streak',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbdffaa97f63',
        number: '0',
        title: 'Longest streak',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        number: '100',
        title: 'Episodes completed',
    }
];

console.log("Dimensions.get('window').width: " + Dimensions.get('window').width)
const HALF_SCREEN_WIDTH = Dimensions.get('window').width / 2
const FOR_TITLE_INSET_LEFT_SPACING = HALF_SCREEN_WIDTH - 28
const TITLE_HORIZONTAL_SPACING = 8
const MAIN_CONTAINER_HORIZONTAL_SPACING = 16

export default function App() {

    const numberScrollContainer = useRef()
    const [snapOffset, setSnapOffset] = useState(Array());
    const [titleWidth, setTitleWidth] = useState(Array(DATA.length).fill(null));
    const [titleScrollContentWidth, setTitleScrollContentWidth] = useState(0);
    const [numberScrollContentHeight, setNumberScrollContentHeight] = useState(0);
    const [titleScrollEndPadding, setTitleScrollEndPadding] = useState(0);

    const ItemNumber = ({id, number}) => (
        <Text key={id} style={styles.number}>{number}</Text>
    );

    const renderItemNumber = function (item) {
        return <ItemNumber key={item.id} number={item.number}/>
    };

    const onContentSizeChangeTitleScroll = (contentWidth) => {
        setTitleScrollContentWidth(contentWidth)
    }

    const onContentSizeChangeNumberScroll = (_, contentHeight) => {
        // console.log("contentHeight: " + contentHeight)
        setNumberScrollContentHeight(contentHeight)
    }

    const handleScrollEnd = (event) => {
        console.log("event.nativeEvent.contentOffset.x: " + event.nativeEvent.contentOffset.x)
        // const percent = (event.nativeEvent.contentOffset.x / titleScrollContentWidth) * 0.5794
        const percent = (event.nativeEvent.contentOffset.x / titleScrollContentWidth) * 0.5794
        console.log("percent: " + percent)

        const offset = numberScrollContentHeight * percent

        numberScrollContainer.current.scrollTo({y: offset, x: 0, animated: false})
    }

    const onLayoutTitle = (event, itemIndex) => {
        const width = event.nativeEvent.layout.width
        console.log("onLayoutTitle# width: " + width + " itemIndex: " + itemIndex)

        titleWidth[itemIndex] = width
        setTitleWidth(titleWidth)
        console.log("widthConcat: " + titleWidth)

        let isFinishedLayoutingTitleScroll = titleWidth.every(element => element !== null)
        if (isFinishedLayoutingTitleScroll) {
            computeOffsets();

            const padding = HALF_SCREEN_WIDTH - 2 * MAIN_CONTAINER_HORIZONTAL_SPACING - titleWidth[titleWidth.length - 1] / 2
            const width = titleScrollContentWidth - FOR_TITLE_INSET_LEFT_SPACING - padding - 2 * TITLE_HORIZONTAL_SPACING

            console.log("onLayoutTitle# padding: " + padding)
            console.log("onLayoutTitle# width: " + width + " titleScrollContentWidth: " + titleScrollContentWidth)
            setTitleScrollContentWidth(width)
            setTitleScrollEndPadding(padding)
        }
    }

    function computeOffsets() {
        let offsets = titleWidth.map((item, index) => (
            computeOffset(item, index)
        ))
        console.log("onLayoutTitleContainer# offsets: " + offsets)
        setSnapOffset(offsets)
    }

    function computeOffset(width, index) {
        let previousWidthSum = 0
        for (let i = 0; i < index; i++) {
            previousWidthSum += titleWidth[i]
        }
        let widthOfCurrentView = 0
        if (index > 0) {
            widthOfCurrentView = width / 2
        }

        return previousWidthSum + index * 2 * TITLE_HORIZONTAL_SPACING + widthOfCurrentView
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.rewardContainer}>
                    <Image source={require('./assets/left_image.png')} style={styles.image}/>
                    <View style={[styles.numberScrollContainer]}>
                        <ScrollView
                            ref={numberScrollContainer}
                            scrollEnabled={false}
                            onContentSizeChange={onContentSizeChangeNumberScroll}
                        >
                            <View style={styles.numberContainer}>
                                {DATA.map((item, _) => renderItemNumber(item))}
                            </View>
                        </ScrollView>
                    </View>
                    <Image source={require('./assets/right_image.png')} style={styles.image}/>
                </View>
                <ScrollView
                    contentContainerStyle={{
                        paddingEnd: titleScrollEndPadding,
                        paddingStart: FOR_TITLE_INSET_LEFT_SPACING,
                        marginVertical: 12,
                    }}
                    horizontal
                    pagingEnabled
                    decelerationRate="fast"
                    snapToOffsets={snapOffset}
                    scrollEventThrottle={16}
                    disableIntervalMomentum={true}
                    onContentSizeChange={onContentSizeChangeTitleScroll}
                    onScroll={handleScrollEnd}
                >
                    <View style={styles.titleContainer}>
                        {DATA.map((item, index) => (
                            <Text key={index}
                                  style={styles.title}
                                  onLayout={(event) => onLayoutTitle(event, index)}
                            >{item.title}</Text>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <StatusBar style="auto"/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
    },
    numberContainer: {
        flexDirection: 'column',
    },
    container: {
        backgroundColor: '#090110'
    },
    mainContainer: {
        marginTop: 32,
        marginHorizontal: MAIN_CONTAINER_HORIZONTAL_SPACING,
        flexDirection: "column",
    },
    rewardContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    numberScrollContainer: {
        maxHeight: 67,
        marginHorizontal: 12
    },
    image: {
        width: 42,
        height: 100,
        tintColor: "#26ffffff"
    },
    item: {
        minWidth: 104,
        marginHorizontal: 12,
    },
    number: {
        fontSize: 32,
        textAlign: "center",
        lineHeight: 67,
        fontWeight: "bold",
        color: "#fff"
    },
    title: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        fontWeight: "bold",
        color: "#fff",
        marginHorizontal: TITLE_HORIZONTAL_SPACING,
    }
});
