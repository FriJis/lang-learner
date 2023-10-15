import { PageManager } from '../../components/PageManager'
import { ControlWorkComponent } from './controlWork'
import { LearnComponent } from './learn'
import { ListenComponent } from './listen'
import { NumbersLearnComponent } from './numbers'
import { WriteComponent } from './write'

export const LearnPage = () => {
    return (
        <PageManager
            pages={[
                {
                    label: 'Quiz',
                    value: 'quiz',
                    component: <LearnComponent />,
                },
                {
                    label: 'Write',
                    value: 'write',
                    component: <WriteComponent />,
                },
                {
                    label: 'Listening',
                    value: 'listening',
                    component: <ListenComponent />,
                },
                {
                    label: 'Numbers',
                    value: 'numbers',
                    component: <NumbersLearnComponent />,
                },
                {
                    label: 'Final test',
                    value: 'controlWork',
                    component: <ControlWorkComponent />,
                },
            ]}
        />
    )
}
