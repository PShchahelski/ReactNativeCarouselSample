import {StatusBar} from 'expo-status-bar';
import React, {useRef, useState} from 'react';
import {Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

const SCORES = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        value: '200000',
        title: 'Mindful minutes',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aww7f63',
        value: '0',
        title: 'Current streak',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbdffaa97f63',
        value: '0',
        title: 'Longest streak',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        value: '100',
        title: 'Episodes completed',
    }
];

console.log("Dimensions.get('window').width: " + Dimensions.get('window').width)
const HALF_SCREEN_WIDTH = Dimensions.get('window').width / 2
const FOR_TITLE_INSET_LEFT_SPACING = HALF_SCREEN_WIDTH - 28
const TITLE_HORIZONTAL_SPACING = 8
const MAIN_CONTAINER_HORIZONTAL_SPACING = 16

export default function App() {

    const scoreScrollContainerRef = useRef()
    const [snapOffset, setSnapOffset] = useState(Array());
    const [titleWidth, setTitleWidth] = useState(Array(SCORES.length).fill(null));
    const [titleScrollContentWidth, setTitleScrollContentWidth] = useState(0);
    const [scoreScrollContentHeight, setScoreScrollContentHeight] = useState(0);
    const [titleScrollEndPadding, setTitleScrollEndPadding] = useState(0);

    const Score = ({id, score}) => (
        <Text key={id} style={styles.score}>{score}</Text>
    );

    const renderScore = function (score) {
        return <Score key={score.id} score={score.value}/>
    };

    const onContentSizeChangeTitleScroll = (contentWidth) => {
        console.log("onContentSizeChangeTitleScroll# contentWidth: " + contentWidth)

        const width = contentWidth - FOR_TITLE_INSET_LEFT_SPACING - titleScrollEndPadding - 2 * TITLE_HORIZONTAL_SPACING
        console.log("onContentSizeChangeTitleScroll# width: " + width + " contentWidth:" + contentWidth)

        setTitleScrollContentWidth(width)
    }

    const onContentSizeChangeScoreScroll = (_, contentHeight) => {
        console.log("contentHeight: " + contentHeight)
        setScoreScrollContentHeight(contentHeight)
    }

    const handleScrollEnd = (event) => {
        const x = event.nativeEvent.contentOffset.x
        console.log("event.nativeEvent.contentOffset.x: " + x)

        let blockIndex = 0
        for (let i = 0; i < snapOffset.length; i++) {
            if (x <= snapOffset[i]) {
                break
            }
            blockIndex++
        }
        console.log("ind: " + blockIndex)

        if (blockIndex > snapOffset.length - 1 || x < 0) {
            return
        }

        let previousWidthSum = snapOffset[blockIndex - 1]
        console.log("handleScrollEnd# previousWidthSum: " + previousWidthSum)

        const alignX = x - previousWidthSum
        console.log("handleScrollEnd# alignX: " + alignX)
        const alignOffset = snapOffset[blockIndex] - previousWidthSum
        console.log("handleScrollEnd# alignX: " + alignOffset + " snapOffset[ind]: " + snapOffset[blockIndex])
        console.log("titleScrollContentWidth# titleScrollContentWidth: " + titleScrollContentWidth)

        let y
        if (x === 0) {
            y = 0
        } else {
            y = alignX / alignOffset * 67 + (blockIndex - 1) * 67
        }
        console.log("y: " + y)

        scoreScrollContainerRef.current.scrollTo({y: y, x: 0, animated: false})
    }

    const onLayoutTitle = (event, itemIndex) => {
        const width = event.nativeEvent.layout.width
        console.log("onLayoutTitle# width: " + width + " itemIndex: " + itemIndex)

        titleWidth[itemIndex] = width
        setTitleWidth(titleWidth)
        console.log("widthConcat: " + titleWidth)

        let isFinishedLayoutingTitleScroll = titleWidth.every(element => element !== null)
        setTitleScrollOffsets(isFinishedLayoutingTitleScroll)
        setScoreScrollEndPadding(isFinishedLayoutingTitleScroll)
    }

    function setScoreScrollEndPadding(isFinishedLayouting) {
        let padding
        if (isFinishedLayouting) {
            padding = HALF_SCREEN_WIDTH - 2 * MAIN_CONTAINER_HORIZONTAL_SPACING - titleWidth[titleWidth.length - 1] / 2
        } else {
            padding = 0
        }
        console.log("onLayoutTitle# padding: " + padding)

        setTitleScrollEndPadding(padding)
    }

    function setTitleScrollOffsets(isFinishedLayouting) {
        if (!isFinishedLayouting) return

        const offsets = titleWidth.map((item, index) => (
            computeOffset(item, index)
        ))
        console.log("setTitleScrollOffsets# offsets: " + offsets)

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
                <View style={styles.scoreContainer}>
                    <Image source={require('./assets/left_image.png')} style={styles.image}/>
                    <View style={[styles.scoreScrollContainer]}>
                        <ScrollView
                            ref={scoreScrollContainerRef}
                            scrollEnabled={false}
                            onContentSizeChange={onContentSizeChangeScoreScroll}
                        >
                            <View style={styles.scoreValueContainer}>
                                {SCORES.map((score, _) => renderScore(score))}
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
                    onContentSizeChange={onContentSizeChangeTitleScroll}
                    onScroll={handleScrollEnd}
                >
                    <View style={styles.scoreTitleContainer}>
                        {SCORES.map((score, index) => (
                            <Text key={index}
                                  style={styles.scoreTitle}
                                  onLayout={(event) => onLayoutTitle(event, index)}
                            >{score.title}</Text>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <StatusBar style="auto"/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scoreTitleContainer: {
        flexDirection: 'row',
    },
    scoreValueContainer: {
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
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    scoreScrollContainer: {
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
    score: {
        fontSize: 32,
        textAlign: "center",
        lineHeight: 67,
        fontWeight: "bold",
        color: "#fff"
    },
    scoreTitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        fontWeight: "bold",
        color: "#fff",
        marginHorizontal: TITLE_HORIZONTAL_SPACING,
    }
});
