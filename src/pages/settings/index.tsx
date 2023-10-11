import { PageManager } from '../../components/PageManager'
import { CollectionSettings } from './collection'
import { ControlWorkSettings } from './controlWork'
import { GeneralSettings } from './general'

export const SettingsPage = () => {
    return (
        <PageManager
            pages={[
                {
                    label: 'General',
                    value: 'general',
                    component: <GeneralSettings />,
                },
                {
                    label: 'Collections',
                    value: 'collections',
                    component: <CollectionSettings />,
                },
                {
                    label: 'Control test',
                    value: 'controlTest',
                    component: <ControlWorkSettings />,
                },
            ]}
        />
    )
}
