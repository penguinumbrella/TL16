import './liveView.css'

const LiveView = () => {
  return (
    <div className='liveView'>
        <div className='charts'>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
          <div className='placeholder-box'></div>
      </div>
      <div className='key'>
        <div className='occupancy-key'>
            <span className='key-label'>Occupancy:</span>
            <div className='key-list'>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'red' }}></span>
                <span className='key-description'>undergraduate</span>
              </div>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'blue' }}></span>
                <span className='key-description'>graduate</span>
              </div>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'blue' }}></span>
                <span className='key-description'>faculty</span>
              </div>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'blue' }}></span>
                <span className='key-description'>transient</span>
              </div>
              <div className='key-item'>
                <span className='key-circle' style={{ backgroundColor: 'blue' }}></span>
                <span className='key-description'>available</span>
              </div>
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