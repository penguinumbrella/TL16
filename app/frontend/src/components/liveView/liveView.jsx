import './liveView.css'

const LiveView = () => {
  return (
    <div className='liveView'>
        <div className='charts'>
        {/* Your charts content goes here */}
      </div>
      <div className='key'>
        <div className='occupancy-key'>
            <span className='key-label'>Occupancy:</span>
            <div className='key-list'>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'red' }}></span>
                <span className='key-description'>Key 1</span>
              </div>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'blue' }}></span>
                <span className='key-description'>Key 2</span>
              </div>
              {/* Add more key items as needed */}
            </div>
            </div>
        <div className='compliance-key'>

        </div>
        {/* Your key content goes here */}
      </div>
    </div>
  )
}

export default LiveView