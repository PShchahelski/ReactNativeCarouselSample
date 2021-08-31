import {StatusBar} from 'expo-status-bar';
import React, {useRef, useState} from 'react';
import {Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

const SCORES = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        value: '200000',
        title: ' minutes',
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

const HALF_SCREEN_WIDTH = Dimensions.get('window').width / 2
const FOR_TITLE_INSET_LEFT_SPACING = HALF_SCREEN_WIDTH - 28
const TITLE_HORIZONTAL_SPACING = 8
const MAIN_CONTAINER_HORIZONTAL_SPACING = 16

export default function App() {

    const scoreScrollContainerRef = useRef()
    const [snapOffset, setSnapOffset] = useState(Array());
    const [titleWidth, setTitleWidth] = useState(Array(SCORES.length).fill(null));
    const [titleScrollEndPadding, setTitleScrollEndPadding] = useState(0);
    const [scoreValueHeight, setScoreValueHeight] = useState(0);

    const Score = ({id, score}) => (
        <Text key={id} style={styles.score}>{score}</Text>
    );

    const renderScore = function (score) {
        return <Score key={score.id} score={score.value}/>
    };

    const onContentSizeChangeScoreScroll = (_, contentHeight) => {
        setScoreValueHeight(contentHeight / SCORES.length)
    }

    const handleScrollEnd = (event) => {
        const scrollX = event.nativeEvent.contentOffset.x
        const blockIndex = findBlockIndexScrollPassed(scrollX)

        // for ios only check
        if (blockIndex > snapOffset.length - 1 || scrollX < 0) {
            return
        }

        const y = computeScoreValueVerticalScrollOffset(scrollX, blockIndex)

        scoreScrollContainerRef.current.scrollTo({y: y, x: 0, animated: false})
    }

    function findBlockIndexScrollPassed(scrollX) {
        let index = 0
        for (let i = 0; i < snapOffset.length; i++) {
            if (scrollX <= snapOffset[i]) {
                break
            }
            index++
        }
        return index;
    }

    function computeScoreValueVerticalScrollOffset(scrollX, blockIndex): number {
        const previousPassedOffset = snapOffset[blockIndex - 1]
        const alignX = scrollX - previousPassedOffset
        const alignOffset = snapOffset[blockIndex] - previousPassedOffset

        if (scrollX === 0) {
            return 0
        } else {
            return alignX / alignOffset * scoreValueHeight + (blockIndex - 1) * scoreValueHeight
        }
    }

    const onLayoutTitle = (event, index) => {
        titleWidth[index] = event.nativeEvent.layout.width
        setTitleWidth(titleWidth)

        let isFinishedLayoutingTitleScroll = titleWidth.every(element => element !== null)
        setTitleScrollOffsets(isFinishedLayoutingTitleScroll)
        setScoreScrollEndPadding(isFinishedLayoutingTitleScroll)
    }

    function setTitleScrollOffsets(isFinishedLayouting) {
        if (!isFinishedLayouting) return

        const offsets = titleWidth.map((width, index) => (
            computeOffset(width, index)
        ))
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
        let removeLastItemPadding = 0
        if (index === titleWidth.length - 1) {
            removeLastItemPadding = 12
        }

        return previousWidthSum + index * 2 * TITLE_HORIZONTAL_SPACING + widthOfCurrentView - removeLastItemPadding
    }

    function setScoreScrollEndPadding(isFinishedLayouting) {
        let padding = 0
        if (isFinishedLayouting) {
            padding = HALF_SCREEN_WIDTH - 2 * MAIN_CONTAINER_HORIZONTAL_SPACING - titleWidth[titleWidth.length - 1] / 2
        }

        setTitleScrollEndPadding(padding)
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
                        paddingVertical: 12,
                    }}
                    horizontal
                    pagingEnabled
                    decelerationRate="fast"
                    snapToOffsets={snapOffset}
                    scrollEventThrottle={16}
                    overScrollMode={'never'}
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
