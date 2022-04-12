import { StyleSheet, Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native'

export const stylesProps: StyleSheet.NamedStyles<{ [key: string]: ViewStyle | TextStyle | ImageStyle }> = {
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    headerContainer: {
        backgroundColor: '#4696ec',
        height: 50,
        paddingTop: Platform.OS === 'ios' ? 44 : 0,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        paddingVertical: 12,
        textAlign: 'center',
    },
    todoContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 2,
        elevation: 4,
        flexDirection: 'row',
        marginHorizontal: 8,
        marginVertical: 4,
        padding: 8,
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    todoHeading: {
        fontSize: 20,
        fontWeight: '600',
    },
    timer: {
        marginLeft: 'auto',
        textAlign: 'center',
        color: 'grey'
    },
    footer: {
        height: 75,
    },
    input: {
        height: 40,
        margin: 12,
        borderBottomWidth: 1,
        padding: 10,
    }
}

export default StyleSheet.create(
    process.env.NODE_ENV === 'production'
        ? stylesProps
        : Object.entries(stylesProps)
            .reduce((prev, [key, value]) => ({
                ...prev, [key]: {
                    ...value,
                    outlineColor: 'red',
                    outlineStyle: 'dashed',
                    outlineWidth: 1,
                }
            }), {})
)
