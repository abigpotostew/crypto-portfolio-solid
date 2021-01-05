import '../styles/globals.css'
// import AppContext, {AppProvider, useStore} from "../contexts/AppContext";
import {useStore} from "../src/redux/store"
import {Provider} from "react-redux";

function MyApp({Component, pageProps}) {
    const store = useStore(pageProps.initialReduxState)

    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    )
}

export default MyApp
