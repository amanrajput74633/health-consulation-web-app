import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol } = useContext(AppContext)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([]) // array of array
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  // -------- Fetch doctor --------
  const fetchDocInfo = () => {
    const info = doctors.find(doc => doc._id === docId)
    setDocInfo(info)
  }

  // -------- Generate slots till next Sunday (ARRAY OF ARRAY) --------
  const getAvailableSlots = () => {
    let slots = []
    let today = new Date()

    let todayDay = today.getDay()
    let daysToNextSunday = (7 - todayDay) % 7
    if (daysToNextSunday === 0) daysToNextSunday = 7

    for (let i = 0; i <= daysToNextSunday; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.toDateString() === currentDate.toDateString()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        )
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        timeSlots.push({
          datetime: new Date(currentDate),
          time: currentDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        })
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      // ✅ PUSH ONLY ARRAY (array of array)
      slots.push(timeSlots)
    }

    setDocSlots(slots)
    setSlotIndex(0)
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) getAvailableSlots()
  }, [docInfo])

  return docInfo && (
    <div>
      {/* Doctor Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <img
          className='bg-primary w-full sm:max-w-72 rounded-lg'
          src={docInfo.image}
          alt=""
        />

        <div className='flex-1 border border-gray-400 rounded-lg p-8 bg-white'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-600'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>

          <p className='text-sm text-gray-600 mt-1'>
            {docInfo.degree} - {docInfo.speciality}
          </p>

          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee:
            <span className='text-gray-600'>
              {currencySymbol}{docInfo.fees}
            </span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className='sm:ml-72 sm:pl-4 mt-6 font-medium text-gray-700'>
        <p>Booking slots</p>

        {/* Date Pills (index based) */}
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.map((_, index) => (
            <div
              key={index}
              onClick={() => setSlotIndex(index)}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer
                ${slotIndex === index
                  ? 'bg-primary text-white'
                  : 'border border-gray-200'}`}
            >
              <p>{daysOfWeek[(new Date().getDay() + index) % 7]}</p>
              <p>{new Date(new Date().setDate(new Date().getDate() + index)).getDate()}</p>
            </div>
          ))}
        </div>

        {/* Time Slots (ARRAY OF ARRAY MAP) */}
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length &&
            docSlots[slotIndex]?.map((item, index) => (
              <p
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer
                  ${slotTime === item.time
                    ? 'bg-primary text-white'
                    : 'border-gray-300 text-gray-600'}`}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
        </div>
        <button className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an appointment</button>
      </div>

      {/* Listing Related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
}

export default Appointment