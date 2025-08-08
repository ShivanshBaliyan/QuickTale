import { useState } from "react"

const InputBox = ({ name, type, id, value, placeholder, icon }) => {

  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <>
      <div className="relative w-[100%] mb-4">
        <input
          name={name}
          type={ type == "password" ? passwordVisible ? "text" : "password" : type}
          placeholder={placeholder}
          value={value}
          id={id}
          className="input-box"
        />

        <i className={`fa-solid fa-${icon} input-icon`}></i>

        {
          type == "password" ? 
            <i className={`fa-solid fa-eye${(!passwordVisible ? "-slash" : "")} absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer`}
              onClick={() => setPasswordVisible(currVal => !currVal)}></i>
          : ""
        }

      </div>
    </>
  )
}

export default InputBox
