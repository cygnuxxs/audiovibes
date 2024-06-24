import Form from '@/components/Form'
import { ModeToggle } from '@/components/ToggleTheme'
import React from 'react'

const Home = () => {
  return (
    <div className='w-screen h-screen flex gap-4 items-center bg-slate-100 justify-center dark:bg-slate-900'>
      <div className='w-3/4 h-[90%] max-sm:h-full space-y-4 p-4 bg-white dark:bg-background shadow max-sm:w-full max-sm:mx-0 rounded-md'>
      <div className='w-full h-[5%] flex justify-between'>
      <p className='text-2xl font-bold text-primary'>AudioVibes <span className='text-sm text-foreground font-medium'>by cygnuxxs</span></p>
      <ModeToggle />
      </div>
      <Form />
      </div>
      </div>
  )
}

export default Home