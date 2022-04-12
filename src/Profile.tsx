import React, { useContext, useEffect, useState } from 'react'
import { Button, View, TextInput, Image, TouchableOpacity } from 'react-native'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import { Auth, Storage } from 'aws-amplify'
import { UserContext, UserAttributes } from '../App'
import styles from './styles'

const Profile = () => {
    const user = useContext(UserContext)
    const [attributes, setAttributes] = useState<UserAttributes>({
        profile: user?.attributes.profile ?? '',
        nickname: user?.attributes.nickname ?? '',
        picture: user?.attributes.picture ?? '',
    })
    const [image, setImage] = useState<string | null>(null)

    useEffect(() => {
        (async () => {
            if (user?.attributes.picture)
                setImage(await Storage.get(user.attributes.picture, { download: false }))
        })()
    }, [user])

    const pickImage = async () => {
        try {
            let result = await launchImageLibraryAsync({
                mediaTypes: MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })
            if (!result.cancelled && user) {
                const blob = await (await fetch(result.uri)).blob()
                await Storage.remove(user.username)
                const uploaded = await Storage.put(user.username, blob)
                updateAttributes('picture', uploaded.key)
                setImage(result.uri)
            }
        } catch (error) {
            console.error(error)
        }
    }
    const updateUser = async () => {
        const user = await Auth.currentAuthenticatedUser()
        await Auth.updateUserAttributes(user, { ...attributes, updated_at: String(Date.now()) })
    }
    const updateAttributes = (key: keyof UserAttributes, value = '') => setAttributes({ ...attributes, [key]: value })

    return (
        <View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={{ uri: image ?? undefined }}
                        style={{ width: 200, height: 200, backgroundColor: 'black', marginVertical: 16 }}
                    />
                </TouchableOpacity>
            </View>
            <TextInput
                defaultValue={attributes.nickname}
                onChangeText={(value) => updateAttributes('nickname', value)}
                placeholder="ニックネーム"
                style={styles.input}
            />
            <TextInput
                defaultValue={attributes.profile}
                onChangeText={(value) => updateAttributes('profile', value)}
                placeholder="自己紹介"
                style={styles.input}
            />
            <View style={{ margin: 12 }}>
                <Button title="更新" onPress={updateUser} />
            </View>
            <View style={{ margin: 12 }}>
                <Button title="ログアウト" onPress={() => Auth.signOut()} />
            </View>
        </View>
    )
}

export default Profile
