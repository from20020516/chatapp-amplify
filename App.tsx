import React, { createContext, useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Button, Text, View, Dimensions, ScaledSize } from 'react-native'
import { Amplify, Auth, AuthModeStrategyType, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import awsconfig from './src/aws-exports'
import Home from './src/Home'
import Profile from './src/Profile'
import styles from './src/styles'

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: `${location.origin}/`,
    redirectSignOut: `${location.origin}/`,
  },
  DataStore: {
    authModeStrategyType: AuthModeStrategyType.MULTI_AUTH
  }
})

const window = Dimensions.get("window")
const screen = Dimensions.get("screen")
const Tab = createBottomTabNavigator()

export interface IUserAttributes extends UserAttributes {
  readonly sub: string
  readonly email_verified: boolean
  readonly phone_number_verified: boolean
  readonly identities: string
}
/** https://docs.amplify.aws/guides/authentication/managing-user-attributes/q/platform/js/ */
export interface UserAttributes {
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phone_number?: string
  address?: string
  updated_at?: string /** unix millis */
}
export interface IUser {
  readonly id: string /** ap-northeast-1:9e346191-b339-4995-bab0-56c755e23842 */
  readonly username: string /** google_114556556928521575351 */
  attributes: IUserAttributes
}
export const UserContext = createContext<IUser | null>(null)

interface IDimensions {
  window: ScaledSize
  screen: ScaledSize
}
export const DimensionContext = createContext<IDimensions | null>(null)

const App = () => {
  const [user, setUser] = useState<IUser | null>(null)
  const [dimensions, setDimensions] = useState({ window, screen })

  useEffect(() => {
    const dimensionsListener = ({ window, screen }: IDimensions) => setDimensions({ window, screen })
    Dimensions.addEventListener('change', dimensionsListener)
    return () => Dimensions.removeEventListener('change', dimensionsListener)
  }, [])

  useEffect(() => {
    /** https://docs.amplify.aws/guides/authentication/listening-for-auth-events/q/platform/js/ */
    Hub.listen('auth', async ({ payload: { event, data } }) => {
      switch (event) {
        case 'tokenRefresh': /** when update user */
          setUser(await Auth.currentUserInfo())
          break
        case 'signOut':
          setUser(null)
          break
        default:
          console.log(event, data)
      }
    });
    (async () => setUser(await Auth.currentUserInfo()))()
    return () => Hub.remove('auth', () => setUser(null))
  }, [])

  return (
    <UserContext.Provider value={user}>
      <DimensionContext.Provider value={dimensions}>
        <View style={styles.container}>
          <NavigationContainer>
            {user ? (
              <Tab.Navigator>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Profile" component={Profile} />
              </Tab.Navigator>
            ) : (
              <>
                <View style={styles.headerContainer}>
                  <Text style={styles.headerTitle}>Flash⚡Chat</Text>
                </View>
                <Home />
                <Button
                  title="Sign In with Google"
                  onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}
                />
                <Text style={{ textAlign: 'center', padding: 10 }}>Copyright</Text>
              </>
            )}
          </NavigationContainer>
        </View>
      </DimensionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
