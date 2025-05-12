<script setup></script>

<template>
  <div class="play-button">
    <div class="play-button__inner">
      <svg
        class="play-button__icon"
        width="37"
        height="40"
        viewBox="0 0 37 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0L37 20L0 40V0Z" fill="white" />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.play-button {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba($color: #000000, $alpha: 0.5);

  &:hover {
    div {
      scale: 1.3;
    }
  }

  &__inner {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease-in-out;
  }

  &__icon {
    height: 40%;
    transform: translateX(5%);
    cursor: pointer;
  }
}
</style>
