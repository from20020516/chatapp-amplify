import React, { useContext, useState } from 'react'
import { Button, View, TextInput } from 'react-native'
import { Auth } from 'aws-amplify'
import { UserContext, UserAttributes } from '../App'
import styles from './styles'

const Profile = () => {
    const user = useContext(UserContext)
    const [attributes, setAttributes] = useState<UserAttributes>({
        profile: user?.attributes.profile,
        nickname: user?.attributes.nickname,
    })
    const updateUser = async () => {
        const user = await Auth.currentAuthenticatedUser()
        await Auth.updateUserAttributes(user, { ...attributes, updated_at: String(Date.now()) })
    }
    const updateAttributes = (key: keyof UserAttributes, value = '') => setAttributes({ ...attributes, [key]: value })

    return (
        <View>
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
