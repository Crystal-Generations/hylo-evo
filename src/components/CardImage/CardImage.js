import React from 'react'
import { bgImageStyle } from 'util/index'
import './CardImage.scss'
import { isEmpty } from 'lodash'

export default function CardImage ({
  firstImageUrl,
  otherImageUrls,
  className,
  linked
}) {
  if (!firstImageUrl) return null

  return <div style={bgImageStyle(firstImageUrl)} className={className}>
    <div>
      {linked && <a href={firstImageUrl} target='_blank' styleName='link'>&nbsp;</a>}
      <div styleName='others'>
        <div styleName='others-inner'>
          {!isEmpty(otherImageUrls) && otherImageUrls.map(url =>
            <a href={url} key={url} target='_blank' styleName='other'>
              <div style={bgImageStyle(url)} />
            </a>)}
        </div>
      </div>
    </div>
  </div>
}
