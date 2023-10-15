import { Select as BaseSelect, FormControl, InputLabel } from '@mui/material'
import { ComponentProps, FC, useId } from 'react'

export const Select: FC<ComponentProps<typeof BaseSelect>> = ({
    label,
    labelId,
    fullWidth,
    ...props
}) => {
    const id = useId()

    return (
        <FormControl fullWidth={fullWidth}>
            <InputLabel id={id}>{label}</InputLabel>
            <BaseSelect
                fullWidth={fullWidth}
                labelId={labelId || id}
                label={label}
                {...props}
            />
        </FormControl>
    )
}
