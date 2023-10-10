import { PageManager } from '../../components/PageManager'
import { AuditionComponent } from './audition'
import { ReadComponent } from './read'

export const ReadPage = () => {
    return (
        <PageManager
            pages={[
                {
                    label: 'Read',
                    value: 'read',
                    component: <ReadComponent />,
                },
                {
                    label: 'Audition',
                    value: 'audition',
                    component: <AuditionComponent />,
                },
            ]}
        />
    )
}
